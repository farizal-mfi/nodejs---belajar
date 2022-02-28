const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}) 



// Menambahkan 1 data
// const contact1 = new contact({
//     nama: 'Hesty',
//     nohp: '2727271828',
//     email: 'hesty@gmail.com'
// })

// simpan ke collection
// contact1.save().then((contact) => console.log(contact))
