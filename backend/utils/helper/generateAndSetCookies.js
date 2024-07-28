import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateAndSetCookies = (user, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return token
};
export default generateAndSetCookies