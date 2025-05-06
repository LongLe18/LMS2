const { PositionPermission, Permission, Position } = require('../models');

const permission = (requiredPermission) => {
    return async (req, res, next) => {
        const positionPermissions = await PositionPermission.findAll({
            include: [
                {
                    model: Permission,
                },
            ],
            where: {
                chuc_vu_id: req.positionId,
            },
        });
        const userPermissions =
            positionPermissions.map((item) => item.quyen_truy_cap.hanh_dong) ||
            [];

        if (userPermissions.includes(requiredPermission)) {
            const position = await Position.findOne({
                where: {
                    chuc_vu_id: req.positionId,
                },
            });
            req.positionCode = position.ma;
            
            return next();
        } else {
            return res
                .status(403)
                .json({ message: 'Forbidden: insufficient permissions' });
        }
    };
};

module.exports = permission;
