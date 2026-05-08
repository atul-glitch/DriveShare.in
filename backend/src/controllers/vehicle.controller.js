import { Vehicle } from "../models/index.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/vehicles          (owner only, requireVerified)
// ─────────────────────────────────────────────────────────────────────────────
export const createVehicle = asyncHandler(async (req, res) => {
  const {
    make, model, year, registrationNumber, color, category,
    fuelType, transmission, seats, mileage, engineCC, bootSpace,
    hasAC, hasBluetooth, hasGPS, hasChildSeat,
    ratePerHour, insuranceAvailable, insuranceFeePerHour,
    longitude, latitude,
    street, city, state, pincode,
  } = req.body;

  if (!req.files?.images || req.files.images.length === 0) {
    throw new ApiError(400, "At least one vehicle image is required");
  }

  // Upload all vehicle images in parallel
  const uploads = await Promise.all(
    req.files.images.map((f) => uploadOnCloudinary(f.path, "vehicles"))
  );
  const imageUrls = uploads.filter(Boolean).map((u) => u.secure_url);
  if (imageUrls.length === 0) throw new ApiError(500, "Image upload failed");

  const vehicle = await Vehicle.create({
    owner: req.user._id,
    make, model, year, registrationNumber, color, category,
    fuelType, transmission,
    seats:    Number(seats),
    mileage:  Number(mileage),
    engineCC: Number(engineCC || 0),
    bootSpace: bootSpace ? Number(bootSpace) : undefined,
    hasAC:         hasAC === "true",
    hasBluetooth:  hasBluetooth === "true",
    hasGPS:        hasGPS === "true",
    hasChildSeat:  hasChildSeat === "true",
    ratePerHour:           Number(ratePerHour || 120),
    insuranceAvailable:    insuranceAvailable === "true",
    insuranceFeePerHour:   Number(insuranceFeePerHour || 0),
    images: imageUrls,
    currentLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      address: { street, city, state, pincode },
    },
  });

  return res.status(201).json(new ApiResponse(201, vehicle, "Vehicle listed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/vehicles?page=1&limit=10&category=suv&fuelType=petrol
//              &lng=85.31&lat=23.36&maxDistance=10000
// ─────────────────────────────────────────────────────────────────────────────
export const getAllVehicles = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 10,
    category, fuelType, transmission,
    minSeats, maxRate,
    lng, lat, maxDistance = 10000, // metres
    sortBy = "createdAt", order = "desc",
  } = req.query;

  const filter = { status: "available" };
  if (category)     filter.category     = category;
  if (fuelType)     filter.fuelType     = fuelType;
  if (transmission) filter.transmission = transmission;
  if (minSeats)     filter.seats        = { $gte: Number(minSeats) };
  if (maxRate)      filter.ratePerHour  = { $lte: Number(maxRate)  };

  let query;

  // ── Geo-based search ──────────────────────────────────────────────────────
  if (lng && lat) {
    const geoStage = {
      $geoNear: {
        near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        distanceField: "distance",
        maxDistance: Number(maxDistance),
        query: filter,
        spherical: true,
      },
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [results, total] = await Promise.all([
      Vehicle.aggregate([
        geoStage,
        { $skip: skip },
        { $limit: Number(limit) },
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
        { $unwind: "$owner" },
        { $project: { "owner.password": 0, "owner.refreshToken": 0 } },
      ]),
      Vehicle.aggregate([geoStage, { $count: "total" }]),
    ]);
    const totalCount = total[0]?.total || 0;
    return res.status(200).json(
      new ApiResponse(200, {
        vehicles: results,
        pagination: { total: totalCount, page: Number(page), limit: Number(limit),
          totalPages: Math.ceil(totalCount / Number(limit)) },
      }, "Nearby vehicles fetched")
    );
  }

  // ── Regular paginated search ───────────────────────────────────────────────
  const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .populate("owner", "fullName avatar phone averageRating")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Vehicle.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      vehicles,
      pagination: { total, page: Number(page), limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) },
    }, "Vehicles fetched")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/vehicles/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate("owner", "fullName avatar phone email averageRating isVerified");
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/vehicles/:id   (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this vehicle");
  }
  if (vehicle.status === "booked") {
    throw new ApiError(400, "Cannot update a vehicle that is currently booked");
  }

  const allowed = [
    "color", "ratePerHour", "insuranceAvailable", "insuranceFeePerHour",
    "status", "hasAC", "hasBluetooth", "hasGPS", "hasChildSeat",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) vehicle[key] = req.body[key];
  });

  // Update location if supplied
  if (req.body.longitude && req.body.latitude) {
    vehicle.currentLocation.coordinates = [
      Number(req.body.longitude),
      Number(req.body.latitude),
    ];
    if (req.body.city)    vehicle.currentLocation.address.city    = req.body.city;
    if (req.body.state)   vehicle.currentLocation.address.state   = req.body.state;
    if (req.body.pincode) vehicle.currentLocation.address.pincode = req.body.pincode;
  }

  await vehicle.save();
  return res.status(200).json(new ApiResponse(200, vehicle, "Vehicle updated"));
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/vehicles/:id   (owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  if (vehicle.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not the owner of this vehicle");
  }
  if (vehicle.status === "booked") {
    throw new ApiError(400, "Cannot delete a vehicle that is currently booked");
  }

  // Delete images from Cloudinary
  await Promise.all(
    vehicle.images.map((url) => {
      const publicId = url.split("/").slice(-2).join("/").split(".")[0];
      return deleteFromCloudinary(publicId);
    })
  );

  await vehicle.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Vehicle deleted"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/vehicles/my-listings   (owner)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, vehicles, "Your listings fetched"));
});
