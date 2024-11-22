import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloduinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: { $ne: loggedInUserId }}).select("-password");

        res.status(200).json(fiteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error);
        res.status(500).json({ message: "Internal server error" });      
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadImage = await cloudinary.uploader.uplaod(image);
            imageUrl = uploadImage.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        // add real-time messaging here

        res.status(200).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}