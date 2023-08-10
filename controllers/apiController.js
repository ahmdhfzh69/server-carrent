const Item = require('../models/Item');
const Rent = require('../models/Booking');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Booking = require('../models/Booking');
const Member = require('../models/Member');

module.exports = {
    landingPage: async (req, res) => {
        try {
        const mostPicked = await Item.find()
        .select('_id title country city price unit imageId')
        .limit(5)
        .populate({ path: 'imageId', select: '_id imageUrl' })
        
        const category = await Category.find()
        .select('_id name')
        .limit(3)
        .populate({ 
            path: 'itemId', 
            select: '_id title country city isPopular imageId',
            perDocumentLimit: 4,
            option:{sort:{sumBooking: -1 }},
            populate: { 
                path: 'imageId', 
                select: '_id imageUrl',
                perDocumentLimit: 1
            }
        })

        const rents = await Rent.find();
        const car = await Item.find();
        const city = await Item.find();

        for(let i = 0; i < category.length; i++){
            for (let x=0; x < category[i].itemId.length; x++) {
                const item = await Item.findOne({_id: category[i].itemId[x]._id });
                item.isPopular = false;
                await item.save();
                if (category[i].itemId[0] === category[i].itemId[x] ){
                    item.isPopular = true;
                    await item.save();
                }
            }
        }

       const testimonial =  {
            _id: "asd1293uasdads1",
            imageUrl: "images/testi.jpg",
            name: "New Member",
            rate: 4.55,
            content: "Kendaraannya nyaman dan lancar di gunakan, enak di pakai pergi jauh",
            familyName: "Ahmad Hafizh",
            familyOccupation: "Kang Rusuh"
          }

        res.status(200).json({ 
            hero: {
                rent: rents.lenght,
                car: car.length,
                cities: city.length
            },
            mostPicked, 
            category,
            testimonial
        })
            
        } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error"})
        }
    },

    detailPage: async (req, res) => {
        try {
          const { id } = req.params;
          const item = await Item.findOne({ _id: id })
            .populate({ path: 'featureId', select: '_id name qty imageUrl' })
            .populate({ path: 'imageId', select: '_id imageUrl' });
    
          const bank = await Bank.find();
    
          const testimonial =  {
            _id: "asd1293uasdads1",
            imageUrl: "images/testi.jpg",
            name: "New Member",
            rate: 4.55,
            content: "Kendaraannya nyaman dan lancar di gunakan, enak di pakai pergi jauh",
            familyName: "Ahmad Hafizh",
            familyOccupation: "Kang Rusuh"
          }
    
          res.status(200).json({
            ...item._doc,
            bank,
            testimonial
          })
    
        } catch (error) {
          res.status(500).json({ message: "Internal server error" });
        }
      },

      bookingPage: async (req, res) => {
        const {
          idItem,
          duration,
          // price,
          rentStartDate,
          rentEndDate,
          firstName,
          lastName,
          email,
          phoneNumber,
          accountHolder,
          bankFrom,
        } = req.body;
    
        if (!req.file) {
          return res.status(404).json({ message: "Image not found" });
        }
    
        console.log(idItem)
    
        if (
          idItem === undefined ||
          duration === undefined ||
          // price === undefined ||
          rentStartDate === undefined ||
          rentEndDate === undefined ||
          firstName === undefined ||
          lastName === undefined ||
          email === undefined ||
          phoneNumber === undefined ||
          accountHolder === undefined ||
          bankFrom === undefined) {
          res.status(404).json({ message: "Lengkapi semua field" });
        }
    
        const item = await Item.findOne({ _id: idItem });
    
        if (!item) {
          return res.status(404).json({ message: "Item not found" });
        }
    
        item.sumBooking += 1;
    
        await item.save();
    
        let total = item.price * duration;
    
        const invoice = Math.floor(1000000 + Math.random() * 9000000);
    
        const member = await Member.create({
          firstName,
          lastName,
          email,
          phoneNumber
        });
    
        const newBooking = {
          invoice,
          rentStartDate,
          rentEndDate,
          total: total,
          itemId: {
            _id: item.id,
            title: item.title,
            price: item.price,
            duration: duration
          },
    
          memberId: member.id,
          payments: {
            proofPayment: `images/${req.file.filename}`,
            bankFrom: bankFrom,
            accountHolder: accountHolder
          }
        }
    
        const booking = await Booking.create(newBooking);
    
        res.status(201).json({ message: "Success Booking", booking });
      }
    }
