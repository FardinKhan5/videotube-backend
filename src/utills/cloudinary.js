import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return uploadResult
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath)
        return null
    }

}

const removeFromCloudinary = async (cloudinaryURL) => {

    try {
        let temp = cloudinaryURL.slice(62)
        let publicId = temp.split(".")

        const deleteResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })

        return deleteResult

    } catch (error) {
        return null
    }

    // https://res.cloudinary.com/drukdfih7/image/upload/v1721039822/mssbpetfka2rg8rweovg.png
}

export { uploadOnCloudinary , removeFromCloudinary}