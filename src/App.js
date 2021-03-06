
import {useState, useEffect} from 'react';
import './style.css';

import firebase from './firebaseConnection';

function App() {
  const [idPost, setIdPost] = useState('');
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [posts, setPosts] = useState([]);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
    const [user, setUser] = useState(false);
  const [userLogged, setUserLogged] = useState({});
 


  useEffect(()=>{
    async function loadPosts(){
      await firebase.firestore().collection('post')
      .onSnapshot((doc)=>{
        let meusPosts = [];

        doc.forEach((item)=>{
          meusPosts.push({
            id: item.id,
            titulo: item.data().titulo,
            autor: item.data().autor,
          })
        });

        setPosts(meusPosts);

      })
    }

    loadPosts();

  }, []);

  useEffect(()=>{
    
    async function checkLogin(){
     await firebase.auth().onAuthStateChanged((user)=>{
      if(user){
        setUser(true);
        setUserLogged({
          uid: user.uid,
          email: user.email
        })
        //se tem usuario logado entra aqui dentro...
      }else{
        //nao possui nenhum user logado.
        setUser(false);
        setUserLogged({});
      }
     })
    }

    checkLogin();


  }, []);

  async function handleAdd(){
    
    await firebase.firestore().collection('posts')
    .add({
      titulo: titulo,
      autor: autor,
    })
    .then(()=>{
      console.log('DADOS CADASTRADO COM SUCESSO!');
      setTitulo('');
      setAutor('');
    })
    .catch((error)=>{
      console.log('GEROU ALGUM ERRO: ' + error);
    })

  }


  async function buscaPost(){
    //  await firebase.firestore().collection('posts')
    //  .doc('123')
    //  .get()
    //  .then((snapshot)=>{

    //   setTitulo(snapshot.data().titulo);
    //   setAutor(snapshot.data().autor);

    //  })
    //  .catch(()=>{
    //    console.log('DEU ALGUM ERRO')
    //  })

    await firebase.firestore().collection('posts')
    .get()
    .then((snapshot)=>{
      let lista = [];

      snapshot.forEach((doc)=>{
        lista.push({
          id: doc.id,
          titulo: doc.data().titulo,
          autor: doc.data().autor
        })
      })

      setPosts(lista);

    })
    .catch(()=>{
      console.log('DEU ALGUM ERRO!');
    })


  }

  async function editarPost(){
    await firebase.firestore().collection('post')
    .doc(idPost)
    .update({
      titulo: titulo,
      autor: autor
    })
    .then(()=>{
      console.log('DADOS ATUALIZADOS COM SUCESSO!');
      setIdPost('');
      setTitulo('');
      setAutor('');
    })
    .catch(()=>{
      console.log('ERRO AO ATUALIZAR');
    });

  }
  async function excluirPost(id){
   await firebase.firestore().collection('post').doc(id)
   .delete()
   .then(()=>{
     alert('Esse post foi excluido!')
   })
  }

  async function novoUsuario(){
    await firebase.auth().createUserWithEmailAndPassword(email, senha)
    .then((value)=>{
      console.log(value);
    })
    .catch((error)=>{ 
      if(error.code === 'auth/weak-password'){
        alert('Senha muito fraca..')
      }else if(error.code === 'auth/email-already-in-use'){
        alert('Esse email j?? existe!');
      }

    })
  }

  async function logout(){
    await firebase.auth().signOut();
  }


  async function fazerLogin(){
    await firebase.auth().signInWithEmailAndPassword(email, senha)
    .then((value)=>{
      console.log(value.user);
    })
    .catch((error)=>{
      /*console.log('ERRO AO FAZER O LOGIN' + error);*/
      alert('Erro ao fazer o Login,Por favor tente novamente!');
    })
  }

  return (
    <div>
      <h1>Bem vindo :)</h1> <br/>


      {user && (
        <div>
          <strong>Seja bem vindo! (Voc?? est?? logado!)</strong> <br/>
          <span>{userLogged.uid} -  {userLogged.email}</span>
          <br/> <br/>
        </div>
      )}

    <div className="container">
    
    <label> Email</label>
      <input className="campo" type="text" value={email} onChange={ (e) => setEmail(e.target.value) } /> <br/>

      <label>Senha</label>
      <input className="campo" type="password" value={senha} onChange={ (e) => setSenha(e.target.value) } /> <br/> 

      <button onClick={ fazerLogin } >Fazer Login</button>
      <button onClick={ novoUsuario }>Cadastrar</button>
      <button onClick={ logout } >Sair da conta!</button> 

      <hr/> <br/>
      <h2>Banco de dados: </h2>
    <label>ID: </label>
    <input className="campo"type="text" value={idPost} onChange={ (e) => setIdPost(e.target.value)} />

    <label >Titulo: </label>
    <textarea className="campo" type="text" value={titulo} onChange={ (e) => setTitulo(e.target.value)} />

    <label >Autor: </label>
    <input className="campo" type="text" value={autor} onChange={ (e) => setAutor(e.target.value) }  />

    <button onClick={ handleAdd }>Cadastrar</button>
    <button onClick={ buscaPost }>Buscar Post</button> <br/>
    <button onClick={ editarPost }>Editar</button> <br/>
    <ul>
      {posts.map((post)=>{
        return(
          <li key={post.id}>
            <span>ID - {post.id} </span> <br/>
            <span>Titulo: {post.titulo} </span> <br/>
            <span>Autor: {post.autor} </span> <br/> <br/>
            <button onClick={ () => excluirPost (post.id)}>Excluir Post </button> <br/> <br/>
          </li>
        )
      })}
    </ul>

    </div>

    </div>
  );
}

export default App;
