const FormSubmission = require('../models/FormSubmission');
const db = require('../db/connection');

exports.saveFormSubmission = async (req, res) => {
  try {
    const { formType, submissionData, carbonFootprint } = req.body;
    const newSubmission = new FormSubmission({
      userId: req.user.id, 
      formType,
      submissionData,
      carbonFootprint
    });

    await newSubmission.save();
    res.status(201).json({
      success: true,
      data: newSubmission
    });
  } catch (error) {
    console.error('Error saving form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving form submission',
      error: error.message
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.findByUserId(req.user.id);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM FormSubmissions WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message
    });
  }
};