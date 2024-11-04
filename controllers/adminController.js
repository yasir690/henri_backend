const privacyModel = require('../model/privacyModel');

const  adminModel  = require('../model/adminModel');
require('dotenv').config();

var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const userModel = require('../model/user');
const newsFeedModel = require('../model/newsFeedModel');
const termsConditionModel = require('../model/termsConditionModel');


//admin Register

const adminRegister=async(req,res)=>{
    try {
       const {adminEmail,adminPassword}=req.body;
       console.log(req.body);

        if(!adminEmail){
            return res.status(400).json({
                success:false,
                message:"email not provide"
            })
        }

        if(!adminPassword){
            return res.status(400).json({
                success:false,
                message:"password not provide"
            })
        }

        const findAdmin=await adminModel.find({adminEmail:adminEmail});

        if(findAdmin.length !=0){
            return res.status(400).json({
                success:false,
                message:"admin already exist"
            })
        }


        const admin= new adminModel({
            adminEmail:adminEmail,
            adminPassword: bcrypt.hashSync(adminPassword, 8)
                });

        const saveAdmin=await admin.save();
     
        if(!saveAdmin){
            return res.status(400).json({
                success:false,
                message:"admin not save"
            })
        }

        return res.status(200).json({
            success:true,
            message:"admin save successfully",
            data:saveAdmin
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}


//admin login

const adminLogin=async(req,res)=>{
    try {
        const {adminEmail,adminPassword}=req.body;
       console.log(req.body);

        if(!adminEmail){
            return res.status(400).json({
                success:false,
                message:"email not provide"
            })
        }

        if(!adminPassword){
            return res.status(400).json({
                success:false,
                message:"password not provide"
            })
        }

        const admin=await adminModel.findOne({adminEmail:adminEmail});

        if(!admin){
            return res.status(400).json({
                success:false,
                message:"admin not found"
            })
        }

        if(!bcrypt.compareSync(adminPassword,admin.adminPassword)){
            return res.status(400).json({
                success:false,
                message:"Please Enter Correct Password"
            })
        }
       

        if (admin && bcrypt.compareSync(adminPassword, admin.adminPassword)) {
            const token = jwt.sign({ user_id: admin._id }, process.env.TOKEN_KEY, {
                expiresIn: "7d",
            });
            admin.adminToken = token;
            admin.isLogOut=false;
            admin.save();

            const response = {
                ...admin._doc,
                adminToken: token
            }


            return res.status(200).json({
                success: true,
                message: "admin login successfully",
                data: response
            })

        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}


const countUser=async(req,res)=>{
    try {
        const {user_id}=req.user;

        const admin=await adminModel.findOne({_id:user_id});

        if(!admin){
            return res.status(400).json({
                success:false,
                message:"admin not found"
            })
        }

        const countDocument=await userModel.countDocuments({_id:{$ne:user_id}});

        if(!countDocument || countDocument.length===0){
            return res.status(400).json({
                success:false,
                message:"user not count"
            })
        }

        return res.status(200).json({
            success:true,
            message:"user count successfully",
            data:countDocument
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}


const getAllUser=async(req,res)=>{
    try {
        const {user_id}=req.user;

        const admin=await adminModel.findOne({_id:user_id});

        if(!admin){
            return res.status(400).json({
                success:false,
                message:"admin not found"
            })
        }
        
        const getUsers=await userModel.find();

        if(!getUsers || getUsers.length===0){
            return res.status(400).json({
                success:false,
                message:"users not found"
            })
        }
        
        return res.status(200).json({
            success:true,
            message:"users found successfully",
            data:getUsers
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}

 //get android and ios user
const getAndroidAndIosUser = async (req, res) => {
    try {
      const { user_id } = req.user;


      const admin = await adminModel.findOne({
        _id: user_id,
      });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Admin Not Found"
        })
      }

      //android user

      const androidUser = await userModel.countDocuments({
        deviceType: 'android'
      });

      //ios user
      const iosUser = await userModel.countDocuments({
        deviceType: 'ios'
      });

      if (androidUser.length === 0 && iosUser.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Android and Ios User Not Available"
        })
      }
    

      if (androidUser.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Ios User Available",
          data: androidUser
        })
      }

      if (iosUser.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Android User Available",
          data: androidUser
        })
      }
      res.status(200).json({
        success: true,
        message: "Andriod and Ios User Found Successfully",
        data:{
            androidUser,iosUser
        }
      
      })

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

const getAllUserPosts=async(req,res)=>{
    try {
        const { user_id } = req.user;
        const {userId}=req.params; 

      const admin = await adminModel.findOne({
        _id: user_id,
      });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Admin Not Found"
        })
      }

      const finduser=await userModel.findById(userId);

      if(!finduser){
        return res.status(400).json({
            success:false,
            message:"user not found"
        })
      }

      const allUserPosts=await newsFeedModel.find({createdBy:userId}).populate("createdBy");

      if(allUserPosts.length===0){
        return res.status(400).json({
            success:false,
            message:"user post not found"
        })
      }
      return res.status(200).json({
        success:true,
        message:"user post found successfully",
        data:allUserPosts
      })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}

//create terms and condition for user

const createUserTermsAndCondition=async(req,res)=>{
  try {
      const {user_id}=req.user;

      const admin=await adminModel.findOne({
          _id:user_id,
      });

      console.log(admin);
      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }

      const {termsCondition}=req.body;

      const findusertermsandcondition=await termsConditionModel.find();

      if(findusertermsandcondition.length > 0){
          return res.status(400).json({
              success:false,
              message:"terms and condition create only once"
          })
      }

      //create

      const createtermsandcondtion=new termsConditionModel({
          termsCondition,
          createdBy:user_id,
      });

      const savetermsandcondtion=await createtermsandcondtion.save();

      if(!savetermsandcondtion){
          return res.status(400).json({
              success:false,
              message:"terms and condition not save"
          })
      }

      return res.status(200).json({
          success:true,
          message:"terms and condition save successfully",
          data:savetermsandcondtion
      })


  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

//get terms and condition for user

const getUsersTermsAndCondition=async(req,res)=>{

  try {
      const {user_id}=req.user;

      const admin=await adminModel.findOne({
          _id:user_id,
      });

      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }
      
      const getusertermsandcondition=await termsConditionModel.find();

      if(!getusertermsandcondition){
          return res.status(400).json({
              success:false,
              message:"terms and condition not found"
          })
      }

      return res.status(200).json({
          success:true,
          message:"terms and condition found successfully",
          data:getusertermsandcondition
      })
  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

//update terms and condition for user

const updateUserTermsAndCondition=async(req,res)=>{
  try {
      const {user_id}=req.user;
      const {id}=req.params;
      const {termsCondition}=req.body;
      const admin=await adminModel.findOne({
          _id:user_id,
      });

      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }
      const findtermsandcondition=await termsConditionModel.findOne({_id:id});

      if(!findtermsandcondition){
          return res.status(400).json({
              success:false,
              message:"terms and condition not found"
          })
      }
      const updatetermsandcondition=await termsConditionModel.findByIdAndUpdate(id,{
        termsCondition
      },{
          new:true
      });

      if(!updatetermsandcondition){
          return res.status(400).json({
              success:false,
              message:"terms and condition not update"
          })
      }

      return res.status(200).json({
          success:true,
          message:"terms and condition update successfully",
          data:updatetermsandcondition
      })
  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

//create privacy policy for user


const createUserPrivacyPolicy=async(req,res)=>{
  try {
      const {user_id}=req.user;

      const admin=await adminModel.findOne({
          _id:user_id,
      });

      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }

      const {privacyPolicy}=req.body;

      const findprivacyPolicy=await privacyModel.find();

      if(findprivacyPolicy.length > 0){
          return res.status(400).json({
              success:false,
              message:"privacy policy create only once"
          })
      }

      //create

      const createPrivacy=new privacyModel({
        privacyPolicy,
        createdBy:user_id,
      });

      const savePrivacyPolicy=await createPrivacy.save();

      if(!savePrivacyPolicy){
          return res.status(400).json({
              success:false,
              message:"privacy policy not save"
          })
      }

      return res.status(200).json({
          success:true,
          message:"privacy policy save successfully",
          data:savePrivacyPolicy
      })


  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

//get privacy policy for user

const getUsersPrivacyPolicy=async(req,res)=>{
  try {
      const {user_id}=req.user;

      const admin=await adminModel.findOne({
          _id:user_id,
      });

      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }
      
      const getprivacy=await privacyModel.find();

      if(!getprivacy){
          return res.status(400).json({
              success:false,
              message:"privacy policy not found"
          })
      }

      return res.status(200).json({
          success:true,
          message:"privacy policy found successfully",
          data:getprivacy
      })
  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

//update privacy policy for user


const updateUserPrivacyPolicy=async(req,res)=>{
  try {
      const {user_id}=req.user;
      const {id}=req.params;
      const {privacyPolicy}=req.body;
      const admin=await adminModel.findOne({
          _id:user_id,
      });

      if(!admin){
          return res.status(400).json({
              success:false,
              message:"admin not found"
          })
      }
      const findprivacy=await privacyModel.findOne({_id:id});

      if(!findprivacy){
          return res.status(400).json({
              success:false,
              message:"privacy policy not found"
          })
      }
      const updateprivacy=await privacyModel.findByIdAndUpdate(id,{
        privacyPolicy
      },{
          new:true
      });

      if(!updateprivacy){
          return res.status(400).json({
              success:false,
              message:"privacy policy not update"
          })
      }

      return res.status(200).json({
          success:true,
          message:"privacy policy update successfully",
          data:updateprivacy
      })
  } catch (error) {
      return res.status(500).json({
          success:false,
          message:error.message
      })
  }
}

const adminLogOut=async(req,res)=>{
    try {
        const {user_id}=req.user;
        const admin=await adminModel.findOne({
            _id:user_id,
        });
  
        if(!admin){
            return res.status(400).json({
                success:false,
                message:"admin not found"
            })
        }
        admin.isLogOut=true;
       await admin.save();

       return res.status(200).json({
        success:true,
        message:"admin logout successfully",
        data:admin
       })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const changePassword=async(req,res)=>{
    try {
        const {user_id}=req.user;
        const {adminPassword, previousPassword}=req.body;
        const admin=await adminModel.findOne({
            _id:user_id,
        });
  
        if(!admin){
            return res.status(400).json({
                success:false,
                message:"admin not found"
            })
        }
        if(!adminPassword){
            return res.status(400).json({
                success:false,
                message:"admin password not provide"
            })
        }
        if(!previousPassword){
            return res.status(400).json({
                success:false,
                message:"admin previous password not provide"
            })
        }

        if(!bcrypt.compareSync(previousPassword,admin.adminPassword)){
            return res.status(400).json({
                success:false,
                message:"please enter your correct previous password"
            })
        }

        const newPasswordHash = await bcrypt.hashSync(adminPassword, 8);

        const updatePassword=await adminModel.findByIdAndUpdate(user_id,{
            adminPassword:newPasswordHash
        },{new:true});
        
        if(!updatePassword){
            return res.status(400).json({
                success:false,
                message:"password not update"
            })
        }

        return res.status(200).json({
            success:true,
            message:"password update successfully",
            data:updatePassword
        })
        
       
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


module.exports={adminRegister,adminLogin,countUser,getAllUser,getAndroidAndIosUser,getAllUserPosts,createUserTermsAndCondition,getUsersTermsAndCondition,updateUserTermsAndCondition,createUserPrivacyPolicy,getUsersPrivacyPolicy,updateUserPrivacyPolicy,adminLogOut,changePassword}