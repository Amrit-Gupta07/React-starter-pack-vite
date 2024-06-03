const Category = require("../models/Category");

exports.createCategory = async (req,res) => {
    try{
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }

        //create entry in db
        const tagDetails = await Category.create({
            name:name,
            description:description,
        });

        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:'Tag created successfully',
        })
    }
    catch(error){
        return res.status(500).json({
            success:true,
            message:error.message,
        })
    }
};


exports.showAllCategories = async(req,res) =>{
    try{
        const allCategories = await Category.find({}, {name:true,description:true});
        return res.status(200).json({
            success:true,
            message:'All tags returned successfully',
            data: allCategories,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//categoryPageDetails

exports.categoryPageDetails = async (req,res) => {

}