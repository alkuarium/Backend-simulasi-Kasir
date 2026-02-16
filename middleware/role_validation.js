export const admin = async(req,res, next)=>{
    const userRole = req.user.role
    if(userRole == 'admin'){
        next()
    }else{
        res.json({
            success: false,
            auth: false,
            message: 'You are not admin'
        })
    }
}
export const admin_stan = async(req,res, next)=>{
    const userRole = req.user.role
    if(userRole == 'admin_stan'){
        next()
    }else{
        res.json({
            success: false,
            auth: false,
            message: 'You are not admin_stan'
        })
    }
}
export const siswa = async(req,res, next)=>{
    const userRole = req.user.role
    if(userRole == 'siswa'){
        next()
    }else{
        res.json({
            success: false,
            auth: false,
            message: 'You are not siswa'
        })
    }
}


export const adsis = async (req, res, next) => {
    const userRole = req.user.role;

    const allowedRoles = ['admin', 'siswa'];

    if (allowedRoles.includes(userRole)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            auth: false,
            message: 'Access denied'
        });
    }
};

export const adstan = async (req, res, next) => {
    const userRole = req.user.role;

    const allowedRoles = ['admin', 'admin_stan'];

    if (allowedRoles.includes(userRole)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            auth: false,
            message: 'Access denied'
        });
    }
};

export const super_role = async (req, res, next) => {
    const userRole = req.user.role;

    const allowedRoles = ['admin', 'admin_stan', 'siswa'];

    if (allowedRoles.includes(userRole)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            auth: false,
            message: 'Access denied'
        });
    }
};
