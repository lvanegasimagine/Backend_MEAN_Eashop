const {Product} = require('../models/product.schema');
const {Category} = require('../models/category.schema');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpeg',
    'image/jpeg': 'jpg',
}

var storage = multer.diskStorage({
    destination: function (req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image type');

        if(isValid){
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    
    filename: function(req, file, cb){
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}- ${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({storage: storage});

// http://localhost:3000/api/v1/products
router.get(`/`, async (req, res) => {
    // const productsList = await Product.find().select('name image -_id'); TODO Aca manda a mostrar los campos que especifiquemos
    // const productsList = await Product.find().populate('category'); TODO Detalla lo que es categoria el populate

    // localhost: 3000/api/v1/products?categories=2342342,234234

    let filter = {};
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    const productsList = await Product.find(filter).populate('category'); 

    if(!productsList){
        res.status(500).json({
            error: err,
            success: false
        })
    }
    res.send(productsList);
});

router.get(`/:id`, async (req, res) => {

    // Primero valida si el id es el correcto.
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id');
    }
    // const productsList = await Product.findById(req.params.id);
    const productsList = await Product.findById(req.params.id).populate('category'); //con el populate y el string que pusimos en ref en el schema de producto podemos ver la collection

    if(!productsList){
        res.status(500).json({
            error: err,
            success: false
        })
    }
    res.send(productsList);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid Category')
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
})

router.put(`/:id`, async(req, res) => {

    // Primero valida si el id es el correcto.
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).send('Invalid Category')
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, //id
        {             //Datos Actualizado
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    );

    if(!category){
        return res.status(400).send('The product cannot be updated!');
    }

    res.status(200).send(product);
});

router.delete(`/:id`, (req, res) => {
    // Primero valida si el id es el correcto.
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id');
    }

    Product.findByIdAndRemove(req.params.id).then( product => {
        if(product){
            return res.status(200).json({
                success: true,
                message: 'the product is deleted!'
            });
        }else{
            return res.status(400).json({
                success: false,
                message: 'Product not Found!'
            });
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    })
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if(!productCount){
        res.status(500).json({
            error: err,
            success: false
        })
    }
    res.send({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products){
        res.status(500).json({
            error: err,
            success: false
        })
    }
    res.send({
        products: products
    });
});
module.exports = router;