import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    durationDays: {
        type: Number,
        required: true,
        max: 14
    },
    expectedResult: {
        type: String,
        default: ''
    },
    aggregatedSummary: {
        type: String,
        default: ''
    },
    uploads: [
        {
            day: {
                type: Number,
                required: true
            },
            analysisId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Analysis'
            },
            fileName: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Sprint = mongoose.model('Sprint', sprintSchema);
export default Sprint;
