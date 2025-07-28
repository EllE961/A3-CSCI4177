import Vendor from '../models/vendorModel.js';

// Format phone number for display
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  // Ensure it's a string and has only digits
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // Handle numbers with country code
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return as-is if format doesn't match expected length
  return phoneNumber;
}

function resolveVendorId(req) {
    return req.user.userId ;
}

function requireVendorId(req, res) {
  const vendorId = resolveVendorId(req);
  if (!vendorId) {
    res.status(401).json({ error: 'Unauthorized: missing or expired token' });
    return null;
  }
  return vendorId;
}

export const addVendorProfile = async (req, res) => {
    const vendorId = requireVendorId(req, res);
    if (!vendorId) return;
    const {
      storeName,
      location,
      logoUrl,
      storeBannerUrl,
      phoneNumber,
      socialLinks,       
    } = req.body;
    if (!storeName || !location || !logoUrl || !storeBannerUrl || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const phoneRegex = /^(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    
    // Clean phone number - remove all non-digit characters
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    try {
      const existing = await Vendor.findOne({ vendorId });
      if (existing) {
        return res.status(409).json({ error: 'Vendor profile already exists.' });
      }
      const newVendor = await Vendor.create({
        vendorId,
        storeName,
        location,
        logoUrl,
        storeBannerUrl,
        phoneNumber: cleanedPhoneNumber,
        socialLink: Array.isArray(socialLinks) ? socialLinks : [],
      });
  
      res.status(201).json({
        message: 'Vendor profile created successfully.',
        profile: {
          vendorId:       newVendor.vendorId,
          storeName:      newVendor.storeName,
          location:       newVendor.location,
          phoneNumber:    formatPhoneNumber(newVendor.phoneNumber),
          logoUrl:        newVendor.logoUrl,
          storeBannerUrl: newVendor.storeBannerUrl,
          socialLinks:    newVendor.socialLink,
          createdAt:      newVendor.createdAt,
        },
      });
    } catch (err) {
      console.error('addVendorProfile error:', err);
      res.status(500).json({ error: 'Server error while creating vendor profile.' });
    }
  };

export const getVendorProfile = async (req, res) => {
    const vendorId = requireVendorId(req, res);
    if (!vendorId) return;
    try {
      const profile = await Vendor.findOne({ vendorId });
      if (!profile)
        return res.status(404).json({ error: 'Vendor profile not found.' });
      const displayProfile = {
        vendorId:       profile.vendorId,
        storeName:      profile.storeName,
        location:       profile.location,
        phoneNumber:    formatPhoneNumber(profile.phoneNumber),
        logoUrl:        profile.logoUrl,
        storeBannerUrl: profile.storeBannerUrl,
        rating:         profile.rating,
        socialLinks:    profile.socialLink, // schema field
      };
      res.status(200).json({ displayProfile });
    } catch (err) {
      console.error('getVendorProfile error:', err);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  };

  export const updateVendorProfile = async (req, res) => {
    const vendorId = requireVendorId(req, res);
    if (!vendorId) return;
  
    const {
      storeName,
      location,
      logoUrl,
      storeBannerUrl,
      phoneNumber,
      socialLinks,
    } = req.body;
  
    if (phoneNumber !== undefined) {
      const phoneRe = /^(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
      if (!phoneRe.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
      }
    }
  
    try {
      const profile = await Vendor.findOne({ vendorId });
      if (!profile) return res.status(404).json({ error: 'Vendor not found.' });
  
      if (storeName       !== undefined) profile.storeName      = storeName;
      if (location        !== undefined) profile.location       = location;
      if (logoUrl         !== undefined) profile.logoUrl        = logoUrl;
      if (storeBannerUrl  !== undefined) profile.storeBannerUrl = storeBannerUrl;
      if (phoneNumber     !== undefined) {
        // Clean phone number - remove all non-digit characters
        const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
        profile.phoneNumber = cleanedPhoneNumber;
      }
      if (socialLinks     !== undefined && Array.isArray(socialLinks)) {
        profile.socialLink = socialLinks;
      }
  
      await profile.save();
  
      return res.status(200).json({
        message: 'Vendor profile updated successfully',
        profile: {
          vendorId:       profile.vendorId,
          storeName:      profile.storeName,
          location:       profile.location,
          phoneNumber:    formatPhoneNumber(profile.phoneNumber),
          logoUrl:        profile.logoUrl,
          storeBannerUrl: profile.storeBannerUrl,
          rating:         profile.rating,
          socialLinks:    profile.socialLink,
        },
      });
    } catch (err) {
      console.error('updateVendorProfile error:', err);
      return res.status(500).json({ error: 'Server error while modifying profile' });
    }
  };
  

    export const getSetting = async (req, res) => {
        const vendorId = requireVendorId(req, res);
        if (!vendorId) return;
      
        try {
          const profile = await Vendor.findOne({ vendorId }, 'settings');
          if (!profile)
            return res.status(404).json({ error: 'Vendor not found.' });
      
          res.status(200).json({ settings: profile.settings });
        } catch (err) {
          console.error('getSetting error:', err);
          res.status(500).json({ error: 'Server error while fetching settings.' });
        }
      };
    
      export const changeSetting = async (req, res) => {
        const vendorId = requireVendorId(req, res);
        if (!vendorId) return;
        const { theme } = req.body;
        if (!theme)
          return res.status(400).json({ error: 'Nothing to update.' });
        try {
          const profile = await Vendor.findOne({ vendorId });
          if (!profile)
            return res.status(404).json({ error: 'Vendor not found.' });
          if (theme)    profile.settings.theme    = theme;
          await profile.save();
          res.status(200).json({ message: 'Settings updated.', settings: profile.settings });
        } catch (err) {
          console.error('changeSetting error:', err);
          res.status(500).json({ error: 'Server error while updating settings.' });
        }
      };
    
      export const approval = async (req, res) => {
        const { id }            = req.params;         
        const { isApproved }    = req.body;           
        if (typeof isApproved !== 'boolean')
          return res.status(400).json({ error: 'isApproved must be boolean.' });
        try {
          const vendor = await Vendor.findOne({ vendorId: id });
          if (!vendor)
            return res.status(404).json({ error: 'Vendor not found.' });
          vendor.isApproved = isApproved;
          await vendor.save();
          res.status(200).json({
            message: 'Vendor approval status updated.',
            vendorId: vendor.vendorId,
            isApproved: vendor.isApproved,
          });
        } catch (err) {
          console.error('approval error:', err);
          res.status(500).json({ error: 'Server error while updating approval.' });
        }
      };

      export const checkApproval = async (req, res) => {
        const { id } = req.params;
        try {
          const vendor = await Vendor.findOne({ vendorId: id }, 'vendorId isApproved');
          if (!vendor)
            return res.status(404).json({ error: 'Vendor not found.' });
          res.status(200).json({
            vendorId: vendor.vendorId,
            isApproved: vendor.isApproved,
          });
        } catch (err) {
          console.error('checkApproval error:', err);
          res.status(500).json({ error: 'Server error while checking approval.' });
        }
      };

// Get all vendors (admin only)
export const getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isApproved,
    } = req.query;

    const query = {};
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Vendor.countDocuments(query);

    res.json({
      vendors: vendors.map(v => ({
        _id: v._id,
        vendorId: v.vendorId,
        storeName: v.storeName,
        location: v.location,
        isApproved: v.isApproved,
        createdAt: v.createdAt,
      })),
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getAllVendors error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

// Public endpoint to list approved vendors (no auth required)
export const listPublicVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sort = "createdAt:desc",
      minRating,         // ⭐ NEW – minimum average rating (e.g. 3 → “3 stars & up”)
    } = req.query;

    /* ---------- query ---------- */
    const query = { isApproved: true };              // only show approved vendors

    // text search (store name or location)
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { location:  { $regex: search, $options: "i" } },
      ];
    }

    // filter by minimum rating
    if (minRating) {
      const ratingNum = parseFloat(minRating);
      if (!isNaN(ratingNum)) query.rating = { $gte: ratingNum };
    }

    /* ---------- sorting ---------- */
    let sortOption = { createdAt: -1 };
    if (sort === "name:asc")        sortOption = { storeName:  1 };
    if (sort === "name:desc")       sortOption = { storeName: -1 };
    if (sort === "createdAt:asc")   sortOption = { createdAt:  1 };
    if (sort === "createdAt:desc")  sortOption = { createdAt: -1 };
    if (sort === "rating:asc")      sortOption = { rating:     1 };   // ⭐ NEW – lowest → highest
    if (sort === "rating:desc")     sortOption = { rating:    -1 };   // ⭐ NEW – highest → lowest

    /* ---------- db query ---------- */
    const vendors = await Vendor.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-phoneNumber -socialLink -payoutSettings"); // exclude sensitive fields

    const total = await Vendor.countDocuments(query);

    /* ---------- transform ---------- */
    const transformedVendors = vendors.map((vendor) => ({
      vendorId:      vendor.vendorId,
      storeName:     vendor.storeName,
      location:      vendor.location,
      logoUrl:       vendor.logoUrl,
      bannerUrl:     vendor.storeBannerUrl,
      rating:        vendor.rating,
      totalProducts: 0, // TODO: fetch from product service
      createdAt:     vendor.createdAt,
      _id:           vendor._id,
    }));

    res.json({
      vendors: transformedVendors,
      page:    Number(page),
      limit:   Number(limit),
      total,
      pages:   Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("listPublicVendors error:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

// Get single vendor profile for public view
export const getPublicVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findOne({ vendorId })
      .select('-payoutSettings'); // Exclude only payment settings, keep phone and social for display
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Transform vendor data for public consumption
    const publicProfile = {
      vendorId: vendor.vendorId,
      storeName: vendor.storeName,
      location: vendor.location,
      phoneNumber: formatPhoneNumber(vendor.phoneNumber),
      logoUrl: vendor.logoUrl,
      bannerUrl: vendor.storeBannerUrl,
      socialLinks: vendor.socialLink,
      rating: vendor.rating,
      isApproved: vendor.isApproved,
      createdAt: vendor.createdAt,
    };
    
    res.json({ vendor: publicProfile });
  } catch (error) {
    console.error('getPublicVendorProfile error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};
