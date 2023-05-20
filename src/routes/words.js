const { Router } = require("express");
const testController = require('../controllers/test');
const userController = require('../controllers/userController');
const wordController = require('../controllers/wordController');
const explanationController = require('../controllers/explanationController');
const transactionController = require('../controllers/transactionController');

router = new Router();

//jwt isinya id user sama status subscription
router.get('/test', testController.test)

// NICHOALS =================================================================================

// get definition
// keywordnya buat mau nyari apa
// auth jwt / api key
router.post('/words/:keyword', wordController.getDefinition)

// get random words
// di query bisa milih randomnya mau berapa
// auth jwt / api key
router.get('/words/random?', wordController.getRandom)

// bayar subscription
// pake jwt buat tau siapa usernya
// return token sama link midtrans
router.post('/subscription/pay', transactionController.addTransaction)

// buat validasi pembayaran
// butuh jwt user
router.post('/subscription/validate', transactionController.validateSubscriptionTransaction)

// buat search word berdasarkan kemiripan
// butuh jwt atau api key user yang udah subskreb
router.get('/words/:keyword/similar', wordController.getSimilarWords)


// VIERY ====================================================================================

// update profile picture
// butuh jwt dan file gambar
router.put('/users/profile', userController.updateUserProfilePicture)

// update password
// butuh jwt, password lama, password baru
router.put('/users/password', userController.updateUserPassword)

// update like/dislike
// 0:none, 1:like, 2:dislike
// butuh jwt sama none, like, atau dislikenya di body
router.post('/explanations/:id/likes', explanationController.updateExplanationLikes)

// get word yang paling sering dicari
// bisa ditaro di query ngambel brp words, defaultnya terserah
// butuh jwt atau api key
router.get('/words?', wordController.getWords)

// buat refresh api key user
// butuh jwt user itu sendiri
router.post('/users/:id/key', userController.regenerateApiKey)

// YOAN =====================================================================================

// add user
// api key digenerate juga disini
router.post('/users', userController.addUser)

// login user
// pake email sama password di body
// return jwt
router.post('/users/login', userController.loginUser)

// add explanation
// butuh jwt dan keyword word apa yang mau dikasi penjelasan
router.post('/explanations', explanationController.addExplanation)

// update explanation
// butuh jwt, sama id explanationnya
router.put('/explanations', explanationController.updateExplanation)

// delete explanation
// butuh jwt, sama id explanationnya
router.delete('/explanations', explanationController.deleteExplanation)


// YURTAN ===================================================================================

// delete user
// butuh jwt
router.delete('/users', userController.deleteUser)

// get users
// bisa ngambel semua user atau difilter terserah wkwk
// butuh jwt & cuman admin doang yang bisa
router.get('/users?', userController.getUsers)

// get user
// bisa ngambel data user
// butuh jwt user itu sendiri atau admin
router.get('/users/:id', userController.getUser)

// buat ngambel explanationnya user, bisa filter by user atau filter by word
// butuh jwt atau api key
router.get('/explanations?', explanationController.getExplanations)

// buat ngambel transaction2, bisa filter batas tanggal awal dan batas tanggal akhir
// butuh jwt ADMIN
router.get('/transactions?', transactionController.getTransactions)



module.exports = router