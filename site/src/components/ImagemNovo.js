import React from "react";
import '../App.css';
import Menu from '../components/Menu.js';
import Spinner from '../components/Spinner.js'
import {Link} from "react-router-dom";

import { Form } from '@unform/web';
import Input from '../misc/Input';
import TextArea from '../misc/TextArea';
import Radio from "../misc/Radio";

import {useState, useRef, useEffect} from 'react';
import HttpClient from '../httpClient/HttpClient.js';
import FileHelper from '../helper/FileHelper';

export default function ImagemNovo ({}) {

  const formRef = useRef([]);

  const [isFetching, setIsFetching] = useState (false);
  const [cls, setCls] = useState ('');
  const [message, setMessage] = useState ('');

  const [pushFields, setPushFields] = useState ('');

  // file upload control
  const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
  // -- //

  let loader = '';

  useEffect (() => {

    formRef.current.setFieldValue('isPush', 'N');
  }, []);

  function handleSubmit(data) {

    if (data.isPush == 'S') {
      if (data.title == '' || data.body == '') {
        setCls ('alert alert-danger');
        setMessage ('Preencha os campos de push!');

        return ;
      }

      data.push = {
        title: data.title,
        body: data.body
      }
    }

    setIsFetching (true)

    function submit (request) {

      HttpClient.addPostImagem (data, (response) => {

        if (response.status == 'ok') {
          setCls ('alert alert-success');

        }
        else {
          setCls ('alert alert-danger');
        }
        setMessage (response.message);
        setIsFetching (false)
      })
    }

    if (isFilePicked) {
      FileHelper.readFileList (selectedFile, (imageList) => {

        data.imagem = imageList
        submit (data);
      })
    }
    else {
      data.imagem = '';
      submit (data);
    }
  }

  // controle de arquivo
  const changeHandler = (event) => {
		setSelectedFile(event.target.files);
		setIsFilePicked(true);
	};

  if (isFetching) {
    loader = <Spinner title={'Registrando Post/Imagem'} subtitle={'Aguerde enquanto processamos sua solicitação'}/>
  }

  function changePushStatus () {

    if (formRef.current.getFieldValue ('isPush') == 'S') {

      let fields = <div class='col-12'>
                    Título Push
                    <Input type='text' name='title' class='form-control' />
                    <br/>
                    Texto Push
                    <Input type='text' name='body' class='form-control' />
                    <br/>
                  </div>

      setPushFields (fields)
    }
    else {
      setPushFields ('');
    }
  }

  return (
    <div className="App">

      { loader }

      <div class='container'>
        <div class='row'>
          <div class='col-6 mx-auto'>

            <h2> Post/Imagem - Novo </h2>
            <div class={cls}> {message} </div>

            <Form onSubmit={handleSubmit} ref={formRef}>
              <br />
              Título
              <Input type='text' name='titulo' class='form-control'/>
              <br />
              Subtítulo
              <Input type='text' name='sub_titulo' class='form-control'/>
              <br />

              Texto
              <TextArea  name='texto' class='form-control' />
              <br/>

              Link
              <Input type='text' name='link' class='form-control' />
              <br />

              Imagens
              <input type='file' name='logo' accept='image/jpg,image/png,image/jpeg' multiple class='form-control' onChange={changeHandler}/>
              <br/>

              Push
              <Radio
                name="isPush"
                options={[{ id: 'S', label: "Sim" }, { id: 'N', label: "Não" }]}
                onClick={changePushStatus}
                defaultChecked='N'
              />
              <br/>

              {pushFields}
              <div class='col-12 text-right'>
                <button type='submit' class='btn btn-success'> Registrar </button>
                &nbsp;
                <Link to={'/post/imagem'} class='btn btn-light'> Voltar </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
