import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const secretKey = 'rahasia'


export const authorize = async(req,res, next) => {
    try {
        const authHeader = req.headers['authorization']
        if(authHeader){
            const token = authHeader.split(' ')[1]
            const verifiedUser = jwt.verify(token, secretKey)
            if(!verifiedUser){
                res.json({
                    succes: false,
                    auth: false,
                    message: "cannot permission to acces"
                })
            }
            else{
                req.user = verifiedUser
                next()
            }
        }else{
            res.json({
                succes: false,
                message: "can't permission access"
            })
        }
    } catch (error) {
        console.log(error);
        if (error.name === 'JsonWebTokenError') {
          return res.json({
            success: false,
            auth: false,
            message: 'Invalid token',
          });
        }
      
    }
}

export const authenticate = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                logged: false,
                message: "email or password invalid"
            });
        }

        // Compare password 
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(404).json({
                success: false,
                logged: false,
                message: "email or password invalid"
            });
        }

        // Buat token
        const token = jwt.sign(
            { id: user.id_user, role: user.role, email: user.email },
            secretKey
        );

        return res.status(200).json({
            success: true,
            logged: true,
            message: "login success",
            data: user,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};