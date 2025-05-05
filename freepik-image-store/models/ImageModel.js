const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // لو عندك موديل لليوزر
        required: true,
    },
    downloadUrl: {
        type: String,
        required: true,
    },
    fileName: {
        type: String, // اختياري لو عايز تحفظ اسم الملف
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
    downloadCount: {
        type: Number,
        default: 0, // عدد التحميلات الحالي، يبدأ من 0
    },
    maxDownloads: {
        type: Number,
        default: 3, // الحد الأقصى للتحميلات، ممكن تغيره
    },
});

module.exports = mongoose.model('Image', imageSchema);