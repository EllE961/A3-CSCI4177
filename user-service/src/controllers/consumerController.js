import Consumer from '../models/consumerModel.js';
import { v4 as uuidv4 } from 'uuid';

function resolveAddressId(req) {
  return req?.address?.addressId || req?.address?.id || null;
}

function requireAddressId(req, res) {
  const addressId = resolveAddressId(req);
  if (!addressId) {
    res.status(401).json({ error: 'Unauthorized: missing or expired token' });
    return null;
  }
  return addressId;
}

function resolveConsumerId(req) {
  return req.user.userId ;
}

function requireConsumerId(req, res) {
  const consumerId = resolveConsumerId(req);
  if (!consumerId) {
    res.status(401).json({ error: 'Unauthorized: missing or expired token' });
    return null;
  }
  return consumerId;
}

export const addConsumerProfile = async (req, res) => {
    const consumerId = requireConsumerId(req, res);
    if (!consumerId) return;
    const { fullName, phoneNumber } = req.body;
    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: 'fullName and phoneNumber are required.' });
    }
    const phoneNumberFormat = /^(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneNumberFormat.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    try {
    if (await Consumer.findOne({ consumerId })) {
      return res.status(409).json({ error: 'Profile already exists for this consumer.' });
    }
    const email = req.user.email;
    const newProfile = await Consumer.create({
      consumerId,
      fullName,
      email,
      phoneNumber,
      addresses: [],
    });
    res.status(201).json({
      message: 'Consumer profile created successfully.',
      profile: {
        consumerId: newProfile.consumerId,
        fullName:   newProfile.fullName,
        email:      newProfile.email,
        phoneNumber:newProfile.phoneNumber,
        createdAt:  newProfile.createdAt,   
      },
    });
  } catch (err) {
    console.error('addConsumerProfile error:', err);
    res.status(500).json({ error: 'Server error while creating profile.' });
  }
};
  
export const getConsumerProfile = async (req, res) => {
    const consumerId = requireConsumerId(req, res);
    if (!consumerId) return;
    try {
        const profile = await Consumer.findOne({ consumerId });
        if (!profile) {
            return res.status(404).json({ error: 'Consumer profile not found.' });
        }
        const displayProfile = {
            consumerId: profile.consumerId,
            fullName: profile.fullName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            createdAt:   profile.createdAt,
        };
        res.status(200).json({ displayProfile });
    } catch (err) {
        console.error('getConsumerProfile error:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

export const updateConsumerProfile = async (req, res) => {
    const consumerId = requireConsumerId(req, res);
    const {fullName, phoneNumber} = req.body;
    const phoneNumberFormat = /^(?:\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (phoneNumber && !phoneNumberFormat.test(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    try {
        const profile = await Consumer.findOne({ consumerId });
        if (!profile) {
            return res.status(404).json({ error: 'Consumer not found.' });
        }
        if (!phoneNumber && !fullName){
          return res.status(400).json({ error: 'Nothing to update.' });
        }
        profile.fullName = fullName;
        profile.phoneNumber = phoneNumber;
        await profile.save();
        res.status(200).json({
            message: 'Consumer profile updated successfully',
            profile: {
                consumerId: profile.consumerId,
                fullName: profile.fullName,
                phoneNumber: profile.phoneNumber,
                createdAt:  profile.createdAt,
            }
        });
    } catch (err) {
        console.error('updateConsumerProfile error:', err);
        res.status(500).json({ error: 'Server error while modifying profile' });
    }
};

export const getSetting = async (req, res) => {
    const consumerId = requireConsumerId(req, res);
    if (!consumerId) return;
  
    try {
      const profile = await Consumer.findOne({ consumerId }, 'settings');
      if (!profile)
        return res.status(404).json({ error: 'Consumer not found.' });
  
      res.status(200).json({ settings: profile.settings });
    } catch (err) {
      console.error('getSetting error:', err);
      res.status(500).json({ error: 'Server error while fetching settings.' });
    }
  };

  export const changeSetting = async (req, res) => {
    const consumerId = requireConsumerId(req, res);
    if (!consumerId) return;
    const { currency, theme } = req.body;
    if (!currency && !theme)
      return res.status(400).json({ error: 'Nothing to update.' });
    try {
      const profile = await Consumer.findOne({ consumerId });
      if (!profile)
        return res.status(404).json({ error: 'Consumer not found.' });
      if (currency) profile.settings.currency = currency;
      if (theme)    profile.settings.theme    = theme;
      await profile.save();
      res.status(200).json({ message: 'Settings updated.', settings: profile.settings });
    } catch (err) {
      console.error('changeSetting error:', err);
      res.status(500).json({ error: 'Server error while updating settings.' });
    }
  };

    export const addNewAddress = async (req, res) => {
        const consumerId = requireConsumerId(req, res);
        if (!consumerId) return;
        const { label, line1, city, postalCode, country } = req.body;
        const postalCodeFormat = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        if (!postalCodeFormat.test(postalCode)) {
            return res.status(400).json({ error: 'Invalid postal code format.' });
        }
        try {
            const profile = await Consumer.findOne({ consumerId });
            if (!profile) {
                return res.status(404).json({ error: 'Consumer not found.' });
            }
            const newAddress = {
                label,
                line1,
                city,
                postalCode,
                country
            };
            profile.addresses.push(newAddress);
            await profile.save();
            res.status(201).json({
                message: 'New address created successfully',
                address: newAddress
            });
        } catch (err) {
            console.error('addNewAddress error:', err);
            res.status(500).json({ error: 'Server error while adding address.' });
        }
    };

    export const getAddresses = async (req, res) => {
        const consumerId = requireConsumerId(req, res);
        if (!consumerId) return;
        try {
            const profile = await Consumer.findOne({ consumerId });
            if (!profile) {
                return res.status(404).json({ error: 'Consumer not found.' });
            }
            res.status(200).json({ addresses: profile.addresses });
        } catch (err) {
            console.error('getAddresses error:', err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
    

    export const updateAddress = async (req, res) => {
        const consumerId = requireConsumerId(req, res);
        if (!consumerId) return;
        const { id } = req.params;                         
        const { label, line1, city, postalCode, country } = req.body;
        if (!label || !line1 || !city || !postalCode || !country)
          return res.status(400).json({ error: 'All fields are required.' });
              const postalCodeFormat = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        if (!postalCodeFormat.test(postalCode))
          return res.status(400).json({ error: 'Invalid postal code format.' });
        try {
          const consumer = await Consumer.findOne({ consumerId });
          if (!consumer)
            return res.status(404).json({ error: 'Consumer not found.' });
          const address = consumer.addresses.id(id);       // built‑in helper
          if (!address)
            return res.status(404).json({ error: 'Address not found.' });
          address.label      = label;
          address.line1      = line1;
          address.city       = city;
          address.postalCode = postalCode;
          address.country    = country;
          await consumer.save();
          res.status(200).json({ message: 'Address updated.', address });
        } catch (err) {
          console.error('updateAddress error:', err);
          res.status(500).json({ error: 'Internal server error.' });
        }
      };

      export const deleteAddress = async (req, res) => {
        const consumerId = requireConsumerId(req, res);
        if (!consumerId) return;
        const { id } = req.params;            
        try {
          const consumer = await Consumer.findOne({ consumerId });
          if (!consumer)
            return res.status(404).json({ error: 'Consumer not found.' });
          const removed = consumer.addresses.pull({ _id: id });
          if (!removed)
            return res.status(404).json({ error: 'Address not found.' });
          await consumer.save();
          res.status(200).json({ message: 'Address deleted successfully.' });
        } catch (err) {
          console.error('deleteAddress error:', err);
          res.status(500).json({ error: 'Internal server error.' });
        }
      };


    