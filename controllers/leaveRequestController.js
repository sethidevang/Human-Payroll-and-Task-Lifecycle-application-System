const { Op } = require('sequelize');
const leaveSchema = require('../models/leaveRequestSchema');

const leaveRequest = async (req, res) => {
    try {
        const inputData = {
            userId: req.user?.id || 101, // Assuming default or from session
            leaveType: req.body.leaveType,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            reason: req.body.reason
        };
        
        // Check for overlapping leave request
        const existingLeave = await leaveSchema.findOne({
            where: {
                userId: inputData.userId,
                [Op.and]: [
                    { startDate: { [Op.lte]: inputData.endDate } },
                    { endDate: { [Op.gte]: inputData.startDate } }
                ]
            }
        });
        
        if (existingLeave) {
            return res.status(400).json({ error: 'Overlapping leave request exists.' });
        }
        
        if (!inputData.userId || !inputData.leaveType || !inputData.startDate || !inputData.endDate || !inputData.reason) {
            return res.status(400).send("Enter All Data");
        }
        
        // Create new leave request record
        const data = await leaveSchema.create(inputData);
        res.status(201).json({
            status: 201,
            message: 'Leave Request Added',
            data: data
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

const updateLeaveRequestStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        const request = await leaveSchema.findByPk(id);

        if (!request) {
            return res.status(404).json({ error: 'Leave request not found.' });
        }

        request.status = status;
        await request.save();

        res.status(200).json({ message: 'Leave request updated.', leaveRequest: request });
    } catch (err) {
        console.error('Error updating leave request:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = { leaveRequest, updateLeaveRequestStatus };