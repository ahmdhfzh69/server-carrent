const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const User = require('../models/User');
const Member = require('../models/Member');
const Booking = require('../models/Booking');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require("bcryptjs")


module.exports = {
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };
      if (req.session.user == null || req.session.user == undefined) {
        res.render('index', {
          alert,
          user: req.session.user,
          title: "Car Rent | Login"
        });
      } else {
        res.redirect('/admin/dashboard');
      }
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
    
    actionSignin: async (req, res) => {
      try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        if (!user) {
          req.flash('alertMessage', 'User yang anda masukan tidak ada!!');
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/signin');
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          req.flash('alertMessage', 'Password yang anda masukan tidak cocok!!');
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/signin');
        }
  
        req.session.user = {
          id: user.id,
          username: user.username
        }
  
        res.redirect('/admin/dashboard');
  
      } catch (error) {
        res.redirect('/admin/signin');
      }
    },
  
    actionLogout: (req, res) => {
      req.session.destroy();
      res.redirect('/admin/signin');
    },
    
    viewDashboard: async (req, res) => {
      try {
        const member = await Member.find();
        const booking = await Booking.find();
        const item = await Item.find();
        res.render('admin/dashboard/view_dashboard', {
          title: "Rent Car | Dashboard",
          user: req.session.user,
          member,
          booking,
          item
        });
      } catch (error) {
        res.redirect('/admin/dashboard');
      }
    },
    viewCategory: async (req, res) => {
        try {
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert =  {message: alertMessage, status: alertStatus };
            res.render('admin/category/view_category', { 
                category,
                alert,
                user: req.session.user,
                title: "Car Rent | Category"
             });            
        } catch (error) {
            res.redirect('/admin/category');
        }
    },
    addCategory: async (req, res) => {
        try {
        const {name} = req.body;
        req.flash('alertMessage', 'Success Add Category');
        req.flash('alertStatus', 'success');
        await Category.create({name});
        res.redirect('/admin/category');

        } catch (error) {
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },
    
    editCategory: async (req, res) => {
        try {
            const { id, name } = req.body;
            const category = await Category.findOne({ _id: id });
            category.name = name;
            await category.save();
            req.flash('alertMessage', 'Success Update Category');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ _id: id });
            await category.deleteOne();
            req.flash('alertMessage', 'Success Delete Category');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/category');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/category');
        }
    },

    viewBank: async (req, res) => {
        try {
            const bank = await Bank.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert =  {message: alertMessage, status: alertStatus };
            res.render('admin/bank/view_bank', {
            title:"Car Rent | Bank",
            user: req.session.user,
            alert,
            bank
        });
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/bank');
        }
    },

    addBank: async (req, res) => {
        try {
          const { name, nameBank, nomorRek } = req.body;
          await Bank.create({
            name,
            nameBank,
            nomorRek,
            imageUrl: `images/${req.file.filename}`
          });
          req.flash('alertMessage', 'Success Add Bank');
          req.flash('alertStatus', 'success');
          res.redirect('/admin/bank');
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/bank');
        }
      },

      editBank: async (req, res) => {
        try {
          const { id, name, nameBank, nomorRek } = req.body;
          const bank = await Bank.findOne({ _id: id });
          if (req.file == undefined) {
            bank.name = name;
            bank.nameBank = nameBank;
            bank.nomorRek = nomorRek;
            await bank.save();
            req.flash('alertMessage', 'Success Update Bank');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/bank');
          } else {
            await fs.unlink(path.join(`public/${bank.imageUrl}`));
            bank.name = name;
            bank.nameBank = nameBank;
            bank.nomorRek = nomorRek;
            bank.imageUrl = `images/${req.file.filename}`
            await bank.save();
            req.flash('alertMessage', 'Success Update Bank');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/bank');
          }
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/bank');
        }
      },

      deleteBank: async (req, res) => {
        try {
          const { id } = req.params;
          const bank = await Bank.findOne({ _id: id });
          await fs.unlink(path.join(`public/${bank.imageUrl}`));
          await bank.deleteOne();
          req.flash('alertMessage', 'Success Delete Bank');
          req.flash('alertStatus', 'success');
          res.redirect('/admin/bank');
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/bank');
        }
      },

      viewItem: async (req, res) => {
        try {
          const item = await Item.find()
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });
    
          const category = await Category.find();
          const alertMessage = req.flash('alertMessage');
          const alertStatus = req.flash('alertStatus');
          const alert = { message: alertMessage, status: alertStatus };
          res.render('admin/item/view_item', {
            title: "Car Rent | Item",
            user: req.session.user,
            category,
            alert,
            item,
            action: 'view'          });
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },
      addItem: async (req, res) => {
        try {
          const { categoryId, title, price, city, about } = req.body;
          if (req.files.length > 0) {
            const category = await Category.findOne({ _id: categoryId });
            const newItem = {
              categoryId,
              title,
              description: about,
              price,
              city
            }
            const item = await Item.create(newItem);
            category.itemId.push({ _id: item._id });
            await category.save();
            for (let i = 0; i < req.files.length; i++) {
              const imageSave = await Image.create({ imageUrl: `images/${req.files[i].filename}` });
              item.imageId.push({ _id: imageSave._id });
              await item.save();
            }
            req.flash('alertMessage', 'Success Add Item');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/item');
          }
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },

      showImageItem: async (req, res) => {
        try {
          const { id } = req.params;
          const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' });
          const alertMessage = req.flash('alertMessage');
          const alertStatus = req.flash('alertStatus');
          const alert = { message: alertMessage, status: alertStatus };
          res.render('admin/item/view_item', {
            title: "Car Rent | Show Image Item",
            user: req.session.user,
            alert,
            item,
            action: 'show image'
          });
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },
      showEditItem: async (req, res) => {
        try {
          const { id } = req.params;
          const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });
          const category = await Category.find();
          const alertMessage = req.flash('alertMessage');
          const alertStatus = req.flash('alertStatus');
          const alert = { message: alertMessage, status: alertStatus };
          res.render('admin/item/view_item', {
            title: "Car Rent | Edit Item",
            alert,
            item,
            category,
            action: 'edit'
        });
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },
      editItem: async (req, res) => {
        try {
          const { id } = req.params;
          const { categoryId, title, price, city, about } = req.body;
          const item = await Item.findOne({ _id: id })
            .populate({ path: 'imageId', select: 'id imageUrl' })
            .populate({ path: 'categoryId', select: 'id name' });
    
          if (req.files.length > 0) {
            for (let i = 0; i < item.imageId.length; i++) {
              const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });
              await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
              imageUpdate.imageUrl = `images/${req.files[i].filename}`;
              await imageUpdate.save();
            }
            item.title = title;
            item.price = price;
            item.city = city;
            item.description = about;
            item.categoryId = categoryId;
            await item.save();
            req.flash('alertMessage', 'Success update Item');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/item');
          } else {
            item.title = title;
            item.price = price;
            item.city = city;
            item.description = about;
            item.categoryId = categoryId;
            await item.save();
            req.flash('alertMessage', 'Success update Item');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/item');
          }
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },

      deleteItem: async (req, res) => {
        try {
          const { id } = req.params;
          const item = await Item.findOne({ _id: id }).populate('imageId');
          for (let i = 0; i < item.imageId.length; i++) {
            Image.findOne({ _id: item.imageId[i]._id }).then((image) => {
              fs.unlink(path.join(`public/${image.imageUrl}`));
              image.deleteOne();
            }).catch((error) => {
              req.flash('alertMessage', `${error.message}`);
              req.flash('alertStatus', 'danger');
              res.redirect('/admin/item');
            });
          }
          await item.deleteOne();
          req.flash('alertMessage', 'Success delete Item');
          req.flash('alertStatus', 'success');
          res.redirect('/admin/item');
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/item');
        }
      },
      viewDetailItem: async (req, res) => {
        const { itemId } = req.params;
        try {
          const alertMessage = req.flash('alertMessage');
          const alertStatus = req.flash('alertStatus');
          const alert = { message: alertMessage, status: alertStatus };
          const feature = await Feature.find({ itemId: itemId });
          res.render('admin/item/detail_item/view_detail_item', {
            title: 'Car Rent | Detail Item',
            user: req.session.user,
            alert,
            itemId,
            feature
          })
    
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
      },
      addFeature: async (req, res) => {
        const { name, qty, itemId } = req.body;
    
        try {
          if (!req.file) {
            req.flash('alertMessage', 'Image not found');
            req.flash('alertStatus', 'danger');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
          }
          const feature = await Feature.create({
            name,
            qty,
            itemId,
            imageUrl: `images/${req.file.filename}`
          });
    
          const item = await Item.findOne({ _id: itemId });
          item.featureId.push({ _id: feature._id });
          await item.save()
          req.flash('alertMessage', 'Success Add Feature');
          req.flash('alertStatus', 'success');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
      },
      editFeature: async (req, res) => {
        const { id, name, qty, itemId } = req.body;
        try {
          const feature = await Feature.findOne({ _id: id });
          if (req.file == undefined) {
            feature.name = name;
            feature.qty = qty;
            await feature.save();
            req.flash('alertMessage', 'Success Update Feature');
            req.flash('alertStatus', 'success');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
          } else {
            await fs.unlink(path.join(`public/${feature.imageUrl}`));
            feature.name = name;
            feature.qty = qty;
            feature.imageUrl = `images/${req.file.filename}`
            await feature.save();
            req.flash('alertMessage', 'Success Update Feature');
            req.flash('alertStatus', 'success');
            res.redirect(`/admin/item/show-detail-item/${itemId}`);
          }
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
      },
      deleteFeature: async (req, res) => {
        const { id, itemId } = req.params;
        try {
          const feature = await Feature.findOne({ _id: id });
    
          const item = await Item.findOne({ _id: itemId }).populate('featureId');
          for (let i = 0; i < item.featureId.length; i++) {
            if (item.featureId[i]._id.toString() === feature._id.toString()) {
              item.featureId.pull({ _id: feature._id });
              await item.save();
            }
          }
          await fs.unlink(path.join(`public/${feature.imageUrl}`));
          await feature.deleteOne();
          req.flash('alertMessage', 'Success Delete Feature');
          req.flash('alertStatus', 'success');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect(`/admin/item/show-detail-item/${itemId}`);
        }
      },
      viewUser: async (req, res) => {
        try {
            const user = await User.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert =  {message: alertMessage, status: alertStatus };
            res.render('admin/user/view_user', { 
                user,
                user: req.session.user,
                alert,
                title: "Car Rent | User"
             });            
        } catch (error) {
            res.redirect('/admin/user');
        }
    },
    addUser: async (req, res) => {
        try {
        const { username, password } = req.body;
        req.flash('alertMessage', 'Success Add User');
        req.flash('alertStatus', 'success');
        await User.create({
          username,
          password
        });
        res.redirect('/admin/user');

        } catch (error) {
        req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
            res.redirect('/admin/user');
        }
    },
    
    editUser: async (req, res) => {
        try {
            const { id, username, password } = req.body;
            const user = await User.findOne({ _id: id });
            user.username = username;
            user.password = password;

            await user.save();
            req.flash('alertMessage', 'Success Update User');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/user');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
        req.flash('alertStatus', 'danger');
            res.redirect('/admin/user');
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({ _id: id });
            await user.deleteOne();
            req.flash('alertMessage', 'Success Delete Category');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/user');
            
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/user');
        }
    },
    viewMember: async (req, res) => {
      try {
          const member = await Member.find();
          const alertMessage = req.flash('alertMessage');
          const alertStatus = req.flash('alertStatus');
          const alert =  {message: alertMessage, status: alertStatus };
          res.render('admin/member/view_member', { 
              member,
              user: req.session.user,
              alert,
              title: "Car Rent | Member"
           });            
      } catch (error) {
          res.redirect('/admin/member');
      }
  },
  addMember: async (req, res) => {
      try {
      const { firstName, lastName, email, phoneNumber } = req.body;
      req.flash('alertMessage', 'Success Add Member');
      req.flash('alertStatus', 'success');
      await Member.create({
        firstName,
        lastName,
        email,
        phoneNumber
      });
      res.redirect('/admin/member');

      } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
          res.redirect('/admin/member');
      }
  },
  
  editMember: async (req, res) => {
      try {
          const { id, firstName, lastName, email, phoneNumber } = req.body;
          const member = await Member.findOne({ _id: id });
          member.firstName = firstName;
          member.lastName = lastName;
          member.email = email;
          member.phoneNumber = phoneNumber;
          await member.save();
          req.flash('alertMessage', 'Success Update User');
          req.flash('alertStatus', 'success');
          res.redirect('/admin/member');
          
      } catch (error) {
          req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
          res.redirect('/admin/member');
      }
  },

  deleteMember: async (req, res) => {
      try {
          const { id } = req.params;
          const member = await Member.findOne({ _id: id });
          await member.deleteOne();
          req.flash('alertMessage', 'Success Delete Category');
          req.flash('alertStatus', 'success');
          res.redirect('/admin/member');
          
      } catch (error) {
          req.flash('alertMessage', `${error.message}`);
          req.flash('alertStatus', 'danger');
          res.redirect('/admin/member');
      }
  },
  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/view_booking', {
        title: "Car Rent | Booking",
        user: req.session.user,
        booking
      });
    } catch (error) {
      res.redirect('/admin/booking');
    }
  },

  showDetailBooking: async (req, res) => {
    const { id } = req.params
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus };

      const booking = await Booking.findOne({ _id: id })
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/show_detail_booking', {
        title: "Car Rent | Detail Booking",
        user: req.session.user,
        booking,
        alert
      });
    } catch (error) {
      res.redirect('/admin/booking');
    }
  },

  actionConfirmation: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = 'Accept';
      await booking.save();
      req.flash('alertMessage', 'Success Confirmation Pembayaran');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },

  actionReject: async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await Booking.findOne({ _id: id });
      booking.payments.status = 'Reject';
      await booking.save();
      req.flash('alertMessage', 'Success Reject Pembayaran');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  }
};