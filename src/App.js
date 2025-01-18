import React from 'react';
import CustomAuthenticate from './screens/CustomAuthenticate'; // Importa el archivo que creaste
import { useState, useRef } from 'react';
import logo from "../src/img/Truora Logo.svg"
import centerImage from "../src/img/centralgrande.webp"
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const App = () => {

  const [isAuthScreen, setIsAuthScreen] = useState(false)

  return (
    <div>
      {isAuthScreen ? (
        <div>
          <button
            onClick={() => setIsAuthScreen(false)}
            style={{
              backgroundColor: '#4F0CF5',
              color: 'white',
              border: 'none',
              width: '80px',
              height: ' 80px',
              padding: '10px 10px',
              margin: '20px',
              borderRadius: '50px',
              cursor: 'pointer',
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} size='2x'/>
          </button>

          <div>
            <CustomAuthenticate />
          </div>
        </div>
      ) : (
        <div style={{ justifyContent: 'center', alignItems: 'center' }}>
          <nav
            style={{
              width: 'full',
              paddingLeft: '20px',
              paddingRight: '20px',
              backgroundColor: 'white', //color del fondo para pruebas
              alignItems: 'center',
              justifyContent: 'space-around',
              display: 'flex',
              flexDirection: 'row',
            }}>
            <div>
              <img src={logo} alt="My SVG Icon" style={{ width: '150px', height: '100px' }} />
            </div>
            <div style={{ width: '35px' }}>

            </div>
            <button
              onClick={() => setIsAuthScreen(true)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Inicia Sesion
            </button>
          </nav>
          <div style={{
            width: 'full',
            backgroundColor: 'white', //color del fondo para pruebas
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ width: '100%', backgroundColor: '#01022B', height: 60 }}> </div>
            <h1 style={{ color: '#01022C', fontSize: '84px', textAlign: 'center', lineHeight: "0.7", marginBottom: '5px' }}>
              Conectamos <br /> <span style={{ color: '#01022C', fontSize: '64px' }}> empresas y personas </span>
            </h1>

            <h2 style={{ textAlign: "center", fontWeight: 200 }}> Facilita el <span style={{ fontWeight: 400 }}> acceso a tus servicios digitales </span> y mejora tu <br /> relacionamiento con tus clientes de forma segura</h2>
            <div
              style={{
                display: 'flex',
                gap: '16px', // Espaciado entre botones
                justifyContent: 'center', // Centrado horizontal
                alignItems: 'center', // Centrado vertical
                margin: '20px', // Espaciado alrededor
              }}
            >
              <a
                href="https://www.truora.com/es/#productos" // Enlace para "Conoce nuestros productos"
                style={{
                  display: 'inline-block', // Hace que el enlace se comporte como un botón
                  padding: '12px 24px', // Espaciado interno
                  fontSize: '16px', // Tamaño de la fuente
                  fontWeight: 500, // Grosor del texto
                  borderRadius: '8px', // Bordes redondeados
                  border: 'none', // Sin borde
                  cursor: 'pointer', // Cambia el cursor a puntero
                  transition: 'all 0.3s ease', // Transición para hover
                  textDecoration: 'none', // Elimina subrayado
                  backgroundColor: '#7b9cff', // Color de fondo
                  color: 'white', // Color del texto
                }}
              >
                Conoce nuestros productos
              </a>
              <a
                href="https://www.truora.com/es/contacto-ventas" // Enlace para "Hablar con ventas"
                style={{
                  display: 'inline-block', // Hace que el enlace se comporte como un botón
                  padding: '12px 24px', // Espaciado interno
                  fontSize: '16px', // Tamaño de la fuente
                  fontWeight: 500, // Grosor del texto
                  borderRadius: '8px', // Bordes redondeados
                  border: '2px solid #7b9cff', // Borde
                  backgroundColor: 'white', // Fondo blanco
                  color: '#7b9cff', // Color del texto
                  cursor: 'pointer', // Cambia el cursor a puntero
                  textDecoration: 'none', // Elimina subrayado
                  transition: 'all 0.3s ease', // Transición para hover
                }}
              >
                Hablar con ventas
              </a>
            </div>
            <img src={centerImage} alt="imagen central" style={{ width: '80%', height: '500px' }} />
          </div>
        </div>

      )}


    </div >
  );
};

export default App;