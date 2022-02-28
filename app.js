const express = require('express')
const expressLayouts = require('express-ejs-layouts')

// setup flash
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

// setup method override
app.use(methodOverride('_method'))

// setup ejs
app.set('view engine','ejs')
// third party middlaware
app.use(expressLayouts);
//built middleware static
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// konfigutasi flash
app.use(cookieParser('secret'))
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())

// Halaman home
app.get('/', (req, res) => {
    // res.sendFile('./index.html',{ root:__dirname })
    const mahasiswa = [
        {
            nama: 'Farizal',
            email: 'farizal@gmail.com'
        },
        {
            nama: 'hesty',
            email: 'hesty@gmail.com'
        },
        {
            nama: 'reja',
            email: 'reja@gmail.com'
        }
    ]
    res.render('index', { nama: 'Farizal', title: 'NodeJS', mahasiswa, layout: 'layouts/main-layouts'})
})

app.get('/about', (req, res) => {
    
    res.render('about', { 
        layout: 'layouts/main-layouts',
        title: "Halaman About" })
})

app.get('/contact', async(req, res) => {
    const contacts = await Contact.find()
    res.render('contact', { 
        layout: 'layouts/main-layouts',
        title: "Halaman Contact",
        contacts,
        msg: req.flash('msg') 
    })
    // Contact.find().then((contact) => {
    //     res.send(contact)
    // })
})

// Menambah kontak
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layouts'
    })
})

// proses delete contact
// app.get('/contact/delete/:nama', async(req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama})

//     // jika contact tidak ada
//     if(!contact){
//         res.status(404)
//         res.send('<h1>404</h1>')
//     } else {
//         Contact.deleteOne({ _id: contact._id }).then((result) => {
//             req.flash('msg','Data Contact Berhasil Dihapus')
//             res.redirect('/contact')

//         })
//     }
// })

app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg','Data Contact Berhasil Dihapus')
        res.redirect('/contact')
    })
})

//form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama})
    res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layouts',
        contact
    })
})

//proses ubah data
app.put('/contact', [
    body('nama').custom(async(value,{req}) => {
        const duplikat = await Contact.findOne({nama: value})
        if(value !== req.body.oldNama && duplikat){
            throw new Error('Nama Contact sudah digunakan')
        }
        return true
    }),
    check('email','Email Tidak Valid!').isEmail(),
    check('nohp', 'No Hp Tidak Valid!').isMobilePhone('id-ID')

], (req, res) => {
    
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('edit-contact',{
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layouts',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne(
            { _id: req.body._id 
            }, 
            {  
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp
                }
            }).then((result) => {
                req.flash('msg','Data Contact Berhasil Diubah')
                res.redirect('/contact')

            })
    }

})

//proses tambah data contact
app.post('/contact', [
    body('nama').custom(async(value) => {
        const duplikat = await Contact.findOne({nama: value})
        if(duplikat){
            throw new Error('Nama Contact sudah digunakan')
        }
        return true
    }),
    check('email','Email Tidak Valid!').isEmail(),
    check('nohp', 'No Hp Tidak Valid!').isMobilePhone('id-ID')

], (req, res) => {
    
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('add-contact',{
            title: 'Form Tambah Data Contact',
            layout: 'layouts/main-layouts',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (error, result) => {

            req.flash('msg','Data Contact Berhasil ditambahkan')
            res.redirect('/contact')
        }) 
    }

})

//halaman detail kontak
app.get('/contact/:nama', async(req, res) => {
    // const contact = findContact(req.params.nama);
    const contact = await Contact.findOne({nama: req.params.nama});

    res.render('detail', { 
        layout: 'layouts/main-layouts',
        title: "Halaman Detail Contact",
        contact })
  })

app.listen(port, () => {
    console.log(`Mongo Contact app | Listening at http://localhost:${port}`)
})