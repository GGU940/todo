//express 관련
const express = require('express')
const app = express()
const port = 3000

//mongodb 관련
// mongodb : kny | 6r54zTctnQoH3UO7
// mongodb+srv://kny:6r54zTctnQoH3UO7@cluster0.bdzaiug.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// /npm install mongodb
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://kny:6r54zTctnQoH3UO7@cluster0.bdzaiug.mongodb.net/?retryWrites=true&w=majority&';
const client = new MongoClient(url);

//app  : express 의미
app.set('view engine', 'ejs');//view enfine은 ejs로 함. views라는 폴더 무조건 필요. 이 폴더를 기본으로 함
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    res.render('index');
})

async function getDB() {
    await client.connect();         // console.log('db 연결');
    return client.db('todo');    //mongoDB안의 todo 라는 데이터베이스에 접근
}

app.get('/list', async (req, res) => {
    try {
        const db = await getDB();

        //todo DB의 'posts'라는 collection에 접근, 데이터 하나 삽입
        const posts = await db.collection('posts').find().sort({ _id: -1 }).toArray();
        console.log(posts);
        res.render('list', { posts });
    } catch (error) {
        console.error(error)
        res.status(500).send('서버오류발생')
    }
    // res.redirect('list')
    // res.sendFile(__dirname + '/list.html');

})

app.post('/add', async (req, res) => {
    console.log(req.body);
    const { title, dateOfGoals, today } = req.body;
    // console.log(title);
    // console.log(dateOfGoals);

    //받아온 정보를 mongodb에 저장하기
    // nonnectDB()
    try {
        const db = await getDB();
        const result = await db.collection('counter').findOne({
            name:
                "counter"
        });
        console.log('--totalPost--', result.totalPost);
        //todo DB의 'posts'라는 collection에 접근, 데이터 하나 삽입
        await db.collection('posts').insertOne({ _id: result.totalPost + 1, title, dateOfGoals, today })// console.log('db추가확인');
        await db.collection('counter').updateOne({ name: 'counter' }, { $inc: { totalPost: 1 } })
    } catch (error) {
        console.error(error)
    }
    res.redirect('list')
})

app.get('/detail/:id', async (req, res) => {
    //detail에서 받아올건데, id라는 변수로 받아올거야
    const id = parseInt(req.params.id)
    console.log(id);

    try {
        const db = await getDB();

        //todo DB의 'posts'라는 collection에 접근, 데이터 하나 삽입
        const post = await db.collection('posts').findOne({ _id: id })
        res.render('detail', { post })
        // post 라는 변수의 객체 덩어리들을 ,detail.ejs로 넘긴다
    } catch (error) {
        console.error(error)
    }

})

//'/delete'라는 parameter가 실행되면
app.post('/delete', async (req, res) => {
    // console.log(req.body);
    const id = parseInt(req.body.postNum);
    console.log(id);
    try {
        const db = await getDB();
        await db.collection('posts').deleteOne({ _id: id })
        res.redirect('list');
    } catch (error) {
        console.error(error)
    }
})

// 수정페이지
app.get('/edit/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    console.log('id확인', id);
    try {
        const db = await getDB()
        const post = await db.collection('posts').findOne({ _id: id })
        res.render('edit', { post })
    } catch (error) {
        console.log(error)
    }
})

// 수정기능
app.post('/update', async (req, res) => {
    const { id, title, dateOfGoals, today } = req.body;
    console.log(id);
    try {
        const db = await getDB()
        await db.collection('posts').updateOne({ _id: parseInt(id) }, { $set: { title, dateOfGoals, today } })
        res.redirect('/list')
    } catch (error) {
        console.log(error);
    }
})
app.listen(port, () => {
    console.log(`서버 실행중 ... ${port}`);
})

