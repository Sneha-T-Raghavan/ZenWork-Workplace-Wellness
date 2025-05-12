import PixelArt from '../models/pixelModel.js';
import User from '../models/userModel.js';

export const saveDrawing = async (req, res) => {
  try {
    const { title, pixelData, template, gridSize, templateData, colorMap, userId } = req.body;

    if (!title || !pixelData || !template || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Title, pixel data, template, and userId are required',
      });
    }

    // Validate templateData and colorMap for custom templates
    if (template === 'custom') {
      if (!templateData || !colorMap) {
        return res.status(400).json({
          success: false,
          message: 'templateData and colorMap are required for custom templates',
        });
      }
      if (!Array.isArray(templateData) || !templateData.every(row => Array.isArray(row))) {
        return res.status(400).json({
          success: false,
          message: 'templateData must be a 2D array',
        });
      }
      if (typeof colorMap !== 'object' || Object.values(colorMap).some(val => typeof val !== 'string')) {
        return res.status(400).json({
          success: false,
          message: 'colorMap must be an object with string values',
        });
      }
    }

    const newDrawing = new PixelArt({
      user: userId,
      title,
      pixelData,
      template,
      gridSize: template === 'free' ? gridSize : undefined,
      templateData: template === 'custom' ? templateData : undefined,
      colorMap: template === 'custom' ? colorMap : undefined,
    });

    await newDrawing.save();

    // Update user's drawings array
    await User.findByIdAndUpdate(
      userId,
      { $push: { pixelArts: newDrawing._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Drawing saved successfully',
      drawing: newDrawing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserDrawings = async (req, res) => {
  try {
    const { userId } = req.body;
    const drawings = await PixelArt.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('-pixelData -templateData -colorMap'); // Exclude large fields for listing

    res.status(200).json({
      success: true,
      drawings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDrawingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const drawing = await PixelArt.findOne({ _id: id, user: userId }).lean();

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'Drawing not found',
      });
    }

    res.status(200).json({
      success: true,
      drawing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const deletedDrawing = await PixelArt.findOneAndDelete({ _id: id, user: userId });

    if (!deletedDrawing) {
      return res.status(404).json({
        success: false,
        message: 'Drawing not found',
      });
    }

    // Remove from user's drawings array
    await User.findByIdAndUpdate(userId, { $pull: { pixelArts: id } });

    res.status(200).json({
      success: true,
      message: 'Drawing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};