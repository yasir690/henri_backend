var axios = require("axios");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const commentNewsFeedModel = require("../model/commentNewsFeedModel");
const likeNewsFeedModel = require("../model/likeNewsFeedModel");
const newsFeedModel = require("../model/newsFeedModel");
const ratingNewsFeedModel = require("../model/ratingnewsfeedModel");
const shareNewsFeedModel = require("../model/shareNewsFeedModel");
const NotificationService = require("../services/notification")
const { uploadFileWithFolder } = require("../utils/awsFileUploads");
require("dotenv/config");
const { loggerInfo, loggerError } = require('../utils/log');


const uploadOptions = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const addNewsFeed = async (req, res) => {
  try {
    console.log('hit');
    const { title, description } = req.body;
    const { files } = req;
    const { user_id } = req.user;
    const images = [];
    // if (title == undefined || description == undefined || title == "" || description == "" || title == null || description == null) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Title and Description are required",
    //   });
    // }

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.originalname;
        const fileContent = file.buffer;
        const fileLocation = await uploadFileWithFolder(
          fileName,
          "newsFeed",
          fileContent
        );
        images.push(fileLocation);
      }

    }
    const newsFeed = await newsFeedModel.create({
      title: title,
      description: description,
      images: images,
      createdBy: user_id,
    });

    if (!newsFeed) {
      loggerError.error("newsfeed not create", { title: req.body.title })

      return res.status(400).json({
        success: false,
        message: "newsfeed not found"
      })
    }

    loggerInfo.info("newsfeed create succesfully", { title: req.body.title })

    return res.status(200).json({
      success: true,
      message: "News Feed Added Successfully",
      data: newsFeed,
    });
  } catch (error) {
    console.log(error);

    loggerError.error('An error occurred', { error: error });

    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateNewsFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const { files } = req;
    const { user_id } = req.user;
    const images = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.originalname;
      const fileContent = file.buffer;
      const fileLocation = await uploadFileWithFolder(
        fileName,
        "newsFeed",
        fileContent
      );
      images.push(fileLocation);
    }

    const newsFeed = await newsFeedModel.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        images: images,
      },
      { new: true }
    );

    if (!newsFeed) {
      loggerError.error("newsfeed not update", { title: req.body.title })

      return res.status(400).json({
        success: false,
        message: "newsfeed not update"
      })
    }
    loggerInfo.info("newsfeed update successfully", { title: req.body.title })


    res.status(200).json({
      success: true,
      message: "News Feed Updated Successfully",
      data: newsFeed,
    });
  } catch (error) {
    console.log(error);
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteNewsFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const newsFeed = await newsFeedModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true }
    );

    if (!newsFeed) {
      loggerError.error('newsfeed not delete');
      res.status(400).json({
        success: false,
        message: "News Feed not Delete",
      });
    }

    loggerInfo.info('newsfeed delete');

    return res.status(200).json({
      success: true,
      message: "News Feed Deleted Successfully",
      data: newsFeed,
    });
  } catch (error) {
    console.log(error);
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  }
}

const getNewsFeed = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { page, limit } = req.query;
    // Default page and limit
    const defaultPage = 1;
    const defaultLimit = 10;
    // if page and limit is not defined then set default page and limit
    const currentPage = page ? parseInt(page) : defaultPage;
    const currentLimit = limit ? parseInt(limit) : defaultLimit;
    // if page and limit is defined then set skip and limit
    const skip = (currentPage - 1) * currentLimit;
    const limitData = currentLimit;

    const newsFeed = await newsFeedModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitData).populate([
      "rating",
      {
        path: "createdBy",
        model: "users",
      },
      // {
      //   path: "like",
      //   model: "likeNewsFeed",
      // },
      // // {
      // //   path: "comment",
      // //   model: "commentNewsFeed",
      // // },
      // {
      //   path: "share",
      //   model: "shareNewsFeed",
      //   sort: { createdAt: -1 },
      // },
    ]);

    if (!newsFeed) {
      loggerError.error("not fetch news feed");

      return res.status(200).json({
        success: false,
        message: "News Feed not fetched"
      });
    }


    loggerInfo.info("fetch news feed");
    return res.status(200).json({
      success: true,
      message: "News Feed Fetched Successfully",
      data: newsFeed,
    });
  } catch (error) {
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getNewsFeedById = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { newsFeedId } = req.params;

    const newsFeed = await newsFeedModel.findById(newsFeedId).populate([
      {
        path: "like",
        model: "likeNewsFeed",
      },
      {
        path: "comment",
        model: "commentNewsFeed",
      },
      {
        path: "share",
        model: "shareNewsFeed",
      }
    ]);/*  */


    if (!newsFeed) {
      loggerError.error("not fetch news feed by id")

      res.status(400).json({
        success: false,
        message: "News Feed Not Fetched",

      });
    }

    loggerInfo.info("fetch news feed by id")
    res.status(200).json({
      success: true,
      message: "News Feed Fetched Successfully",
      data: newsFeed,
    });
  } catch (error) {
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const shareNewsFeed = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { newsFeedId } = req.params;

    const FindNewsFeed = await newsFeedModel.findById(newsFeedId).lean();
    if (!FindNewsFeed) {
      return res.status(400).json({
        success: false,
        message: "News Feed Not Found",
      });
    }
    // Check if newsfeed is already shared by user
    const isShared = await shareNewsFeedModel.findOne({
      newsFeedId: FindNewsFeed._id,
      sharedBy: user_id,
    }).lean();

    if (isShared) {
      return res.status(400).json({
        success: false,
        message: "News Feed Already Shared",
      });
    }

    const shareNewssFeed = await shareNewsFeedModel.create({
      newsFeedId: FindNewsFeed._id,
      sharedBy: user_id,
    });

    // Push Share NewsFeed Id in newsfeed model
    FindNewsFeed.share.push(shareNewssFeed._id);

    await newsFeedModel.findByIdAndUpdate(
      FindNewsFeed._id,
      FindNewsFeed,
      { new: true }
    );
    // if (!pushShareNewsFeed) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "News Feed Not Found",
    //   });
    // }

    // Fetch newsfeed  
    const newsFeedShare = await newsFeedModel.find({}).sort({ createdAt: -1 }).populate([
      {
        path: "like",
        model: "likeNewsFeed",
      },
      {
        path: "comment",
        model: "commentNewsFeed",
      },
      {
        path: "share",
        model: "shareNewsFeed",
      },
    ]);

    if (!newsFeedShare) {
      loggerError.error("news feed not shared")

      return res.status(400).json({
        success: false,
        message: "News Feed not Shared",

      });
    }

    loggerInfo.info("news feed shared")
    return res.status(200).json({
      success: true,
      message: "News Feed Shared Successfully",
      data: newsFeedShare,
    });
  } catch (error) {
    console.log(error);
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { newsFeedId } = req.params;

    // Check if newsfeed is already liked by user

    const isLiked = await likeNewsFeedModel.findOne({
      newsFeedId: newsFeedId,
      likedBy: user_id,
    }).lean();





    if (isLiked) {
      return res.status(400).json({
        success: false,
        message: "News Feed Already Liked",
      });
    }

    const likeNewsFeed = await likeNewsFeedModel.create({
      newsFeedId: newsFeedId,
      likedBy: user_id,
    });

    // Push Like NewsFeed Id in newsfeed model
    const pushLikeNewsFeed = await newsFeedModel.findByIdAndUpdate(
      newsFeedId,
      {
        $push: {
          like: likeNewsFeed._id,
        },
      },
      { new: true }
    );

    if (!pushLikeNewsFeed) {
      loggerError.error("news feed not liked")

      return res.status(400).json({
        success: false,
        message: "News Feed Not Found",
      });
    }


    loggerInfo.info("news feed liked")

    return res.status(200).json({
      success: true,
      message: "News Feed Liked Successfully",
      data: pushLikeNewsFeed,
    });

  } catch (error) {
    loggerError.error('An error occurred', { error: error });

    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }

};

const commentNewsFeed = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { newsFeedId, commentDetail } = req.body;

    const commentNewsFeed = await commentNewsFeedModel.create({
      newsFeedId: newsFeedId,
      commentDetail: commentDetail,
      commentBy: user_id,
    });

    // Push Comment NewsFeed Id in newsfeed model
    const pushCommentNewsFeed = await newsFeedModel.findByIdAndUpdate(
      newsFeedId,
      {
        $push: {
          comment: commentNewsFeed._id,
        },
      },
      { new: true }
    );

    if (!pushCommentNewsFeed) {
      return res.status(400).json({
        success: false,
        message: "News Feed Not Found",
      });
    }
    await new NotificationService().sendPostNotification(newsFeedId, user_id, pushCommentNewsFeed.createdBy, 'comment');


    res.status(200).json({
      success: true,
      message: "News Feed Commented Successfully",
      data: pushCommentNewsFeed,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateCommentNewsFeed = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { comentID, commentDetail } = req.body;

    const commentNewsFeed = await commentNewsFeedModel.findByIdAndUpdate(
      comentID,
      {
        commentDetail: commentDetail,
      },
      { new: true }
    );

    if (!commentNewsFeed) {
      return res.status(400).json({
        success: false,
        message: "News Feed Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "News Feed Commented Successfully",
      data: commentNewsFeed,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteCommentNewsFeed = async (req, res) => {
  try {
    // const { user_id } = req.user;
    const { comentID } = req.body;

    // const commentNewsFeed = await commentNewsFeedModel.findByIdAndDelete(
    //   comentID
    // );
    // //

    // if (commentNewsFeed) {
    //   // Unfollow
    //   const deleteidinnewsfeedmodel = await newsFeedModel.findOneAndUpdate(
    //       { _id: user_id },
    //       {
    //           $pull: { comment: comentID },
    //       }
    //   );
    //     }
    // if (!commentNewsFeed) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "News Feed Not Found",
    //   });
    // }

    // Step 1: Delete the comment
    await commentNewsFeedModel.findByIdAndDelete(comentID);

    // Step 2: Remove the comment ID from the comments array in the NewsFeed model
    await newsFeedModel.updateOne(
      { comment: comentID },
      { $pull: { comment: comentID } }
    );

    res.status(200).json({
      success: true,
      message: "Comment Deleted Successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getCommentsOfFeed = async (req, res) => {

  try {
    const { user_id } = req.user;
    const { newsFeedId } = req.params;

    const newsFeed = await newsFeedModel.findById(newsFeedId).populate([

      {
        path: "comment",
        model: "commentNewsFeed",
        populate: {
          path: 'commentBy',
        }

      },

    ]);/*  */




    res.status(200).json({
      success: true,
      message: "Comments of  News Feed Fetched Successfully",
      data: newsFeed.comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const ratingPost = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { newsFeedId } = req.params;
    const { rating } = req.body;

    // Check if newsfeed is already rating by user

    const isRating = await ratingNewsFeedModel.findOne(

      { $and: [{ newsFeedId: newsFeedId }, { ratingBy: user_id }] }



    ).lean();


    // Retrieve the post from the database

    const post = await newsFeedModel.findById(newsFeedId).populate(['rating']);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (isRating) {

      const ratingid = post.rating.find(obj => obj.ratingBy.toString() === user_id);


      const ratingNewsFeed = await ratingNewsFeedModel.findByIdAndUpdate(
        ratingid,
        {
          rating: rating
        },
        {
          new: true,
        });
      console.log(post);

      await new NotificationService().sendPostNotification(newsFeedId, user_id, post.createdBy, 'rating');

      return res.status(200).json({
        success: true,
        message: "News Feed rating updated successfully",
        data: ratingNewsFeed,
      });
    }
    // // Check if the post has already been rated
    // if (post.rating) {
    //   // Calculate the new rating by averaging the existing rating and the new rating
    //   const newRating = (post.rating + rating) / 2;
    //   post.rating = newRating;
    //   // console.log(newRating);
    // } else {
    //   // If the post hasn't been rated before, set the rating to the new rating
    //   post.rating = rating;
    // }
    // // console.log(newRating);

    // // create rating on newsfees

    const ratingNewsFeed = await ratingNewsFeedModel.create({
      newsFeedId: newsFeedId,
      ratingBy: user_id,
      rating: rating
    });


    // Push rating NewsFeed Id in newsfeed model
    const pushRatingNewsFeed = await newsFeedModel.findByIdAndUpdate(
      newsFeedId,
      {
        $push: {
          rating: ratingNewsFeed._id,
        },
      },
      { new: true }
    );
    if (!ratingNewsFeed) {
      loggerError.error("news feed not rated")

      return res.status(400).json({
        success: false,
        message: "News Feed Not Found",
      });
    }


    loggerInfo.info("news feed rated")

    return res.status(200).json({
      success: true,
      message: "News Feed rating Successfully",
      data: ratingNewsFeed,
    });

  } catch (error) {
    loggerError.error('An error occurred', { error: error });

    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message

    })
  }
}

const getRatingAverage = async (req, res) => {
  try {

    const posts = await newsFeedModel.find().populate(

      [
        "rating",

        "rating.ratingBy"

        // {
        //   path: "rating",
        //   populate: {
        //     path: 'ratingBy',
        //     model: 'user'
        //   }
        // },

      ]
    );

    if (posts.length === 0) {
      return res.json({ averageRating: 0, postCount: 0 });
    }

    let totalRating = 0;
    let postCount = 0;

    const ratingsadd = [];

    posts.forEach(post => {
      const ratings = post.rating;
      if (ratings.length > 0) {
        const ratingSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = (ratingSum / (ratings.length * 5)) * 5;
        ratingsadd.push({
          'count': averageRating,
          'description': post.description,
          'images': post.images,
          'createdAt': post.createdAt,

        });
        totalRating += averageRating;
        postCount++;
      }
    });

    const averageRating = totalRating / postCount;
    //get username which user is rate on post


    // posts.forEach(item => {
    //   console.log(item);

    //   const userinfo = item.createdBy;
    //   const userName = userinfo.userName

    //   console.log(userName);
    //   usernames.push(userName)
    // })
    loggerInfo.info("avarage rated found")

    return res.status(200).json({
      success: true,
      message: "average rating found",
      data: {
        averageRating, postCount,
        ratings: ratingsadd
      }
    })

  } catch (error) {
    loggerError.error('An error occurred', { error: error });

    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}


module.exports = {
  addNewsFeed: [uploadOptions.array("images", 5), addNewsFeed],
  // addNewsFeed,
  updateNewsFeed: [uploadOptions.array("images", 5), updateNewsFeed],
  deleteNewsFeed,
  getNewsFeed,
  getNewsFeedById,
  shareNewsFeed,
  likePost,
  commentNewsFeed,
  updateCommentNewsFeed,
  deleteCommentNewsFeed,
  getCommentsOfFeed,
  ratingPost,
  getRatingAverage

};
