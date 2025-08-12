const FormSubmission = require('../models/FormSubmission');
const db = require('../db/connection');

exports.saveFormSubmission = async (req, res) => {
  try {
    console.log('💾 Saving form submission for user:', req.user.id);
    const { formType, submissionData, carbonFootprint } = req.body;
    
    // Validate required fields
    if (!formType || !submissionData) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Form type and submission data are required'
      });
    }

    const newSubmission = new FormSubmission({
      userId: req.user.id, 
      formType,
      submissionData,
      carbonFootprint: carbonFootprint || 0
    });

    await newSubmission.save();
    console.log('✅ Form submission saved successfully:', newSubmission.id);
    
    res.status(201).json({
      success: true,
      message: 'Form submission saved successfully',
      data: {
        id: newSubmission.id,
        formType: newSubmission.formType,
        carbonFootprint: newSubmission.carbonFootprint,
        submittedAt: newSubmission.submittedAt
      }
    });
  } catch (error) {
    console.error('❌ Error saving form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving form submission',
      error: error.message
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    console.log('📊 Fetching submissions for user:', req.user.id);
    const submissions = await FormSubmission.findByUserId(req.user.id);
    console.log(`📋 Found ${submissions.length} submissions`);

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('❌ Error fetching submissions:', error);
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
    console.log(`🗑️ Deleting submission ${id} for user ${req.user.id}`);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid submission ID is required'
      });
    }

    const [result] = await db.query(
      'DELETE FROM FormSubmissions WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Submission not found or not authorized');
      return res.status(404).json({
        success: false,
        message: 'Submission not found or not authorized'
      });
    }

    console.log('✅ Submission deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message
    });
  }
};
