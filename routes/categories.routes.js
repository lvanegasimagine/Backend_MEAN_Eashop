const {Category} = require('../models/category.schema');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
});

router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(500).json({
            success: true,
            message: 'the category with the given ID was'
        });
    }

    res.status(200).send(category);
})

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });

    category = await category.save();

    if(!category){
        res.status(400).send('the category cannot be created');
    }

    res.send(category);
});

router.put('/:id', async(req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, //id
        {             //Datos Actualizado
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        {new: true}
    );

    if(!category){
        return res.status(400).send('The category cannot be created!');
    }

    res.status(200).send(category);
});

//api/v1/categories/id
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then( category => {
        if(category){
            return res.status(200).json({
                success: true,
                message: 'the category is deleted!'
            });
        }else{
            return res.status(400).json({
                success: false,
                message: 'Category not Found!'
            });
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    })
})



module.exports =router;