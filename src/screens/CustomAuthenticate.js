import { Amplify } from 'aws-amplify';
import { uploadData } from '@aws-amplify/storage';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from '../aws-exports';
import Webcam from 'react-webcam';
import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import logo from "../../src/img/Truora Logo.svg"


Amplify.configure(awsconfig);

function CustomAuthenticate({ signOut, user }) {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [secondImgSrc, setSecondImgSrc] = useState(null); // Segunda foto para comparación
    const [isComparing, setIsComparing] = useState(false); // Estado para manejar la vista de comparación
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [comparisonResult, setComparisonResult] = useState(null); // Resultado de comparación
    const [fotoReferencia, setFotoReferencia] = useState(false)
    const [fotoComparacion, setFotoComparacion] = useState(false)

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (fotoComparacion) {
            setSecondImgSrc(imageSrc); // Captura la segunda foto si estamos en el modo de comparación
        } else {
            setImgSrc(imageSrc); // Captura la primera foto
        }
    };

    const retake = () => {
        if (fotoComparacion) {
            setSecondImgSrc(null); // Rehacer la segunda foto
        } else {
            setImgSrc(null); // Rehacer la primera foto
        }
    };

    const savePhoto = async () => {
        if (!imgSrc) return;
        try {
            setIsUploading(true);

            const response = await fetch(imgSrc);
            const blob = await response.blob();
            const fileName = `${user.username}/photo-${Date.now()}.jpg`;

            await uploadData({
                key: fileName,
                data: blob,
                contentType: 'image/jpeg'
            }).result;

            setImgSrc(fileName);
            console.log(fileName)
            showNotification('¡Foto guardada exitosamente! 📸');

            // Si tienes la función loadSavedPhotos implementada, descomenta la siguiente línea
            // loadSavedPhotos();
        } catch (error) {
            console.error('Error al guardar la foto:', error);
            showNotification('Error al guardar la foto ❌', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const uploadSecondPhoto = async () => {
        if (!secondImgSrc) return; // Verificar si la segunda foto está lista
        try {
            setIsUploading(true);

            // Convertir la imagen capturada en un blob
            const response = await fetch(secondImgSrc);
            const blob = await response.blob();
            const fileName = `${user.username}/compare-photo-${Date.now()}.jpg`; // Nombre único para la segunda foto

            // Subir la foto a S3
            await uploadData({
                key: fileName,
                data: blob,
                contentType: 'image/jpeg',
            }).result;
            setSecondImgSrc(fileName);
            console.log(fileName)
            showNotification('¡Segunda foto guardada exitosamente! 📸');


            // Aquí podríamos guardar el nombre del archivo en un estado para su uso posterior
            return fileName;
        } catch (error) {
            console.error('Error al subir la segunda foto:', error);
            showNotification('Error al subir la segunda foto ❌', 'error');
        } finally {
            setIsUploading(false);
        }
    };



    /* const comparePhotos = async () => {
      if (!imgSrc || !secondImgSrc) {
        showNotification('Faltan imágenes para comparar ❌', 'error');
        return;
      }
      console.log(imgSrc)
      console.log(secondImgSrc)
      console.log(user.username)
      
      try {
        const response = await fetch('https://3yksz3lr73.execute-api.us-east-1.amazonaws.com/dev/compare', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: user.username,
            sourceKey: imgSrc,
            targetKey: secondImgSrc,
          }),
        });
        
  
        if (!response.ok) {
          throw new Error('Error en la comparación de imágenes');
        }
  
        const result = await response.json();
        setComparisonResult(result);
        if (result.match) {
          showNotification(`¡Coincidencia exitosa! Similitud: ${result.similarity}%`);
        } else {
          showNotification('Las imágenes no coinciden ❌', 'error');
        }
      } catch (error) {
        console.error('Error al comparar las fotos:', error);
        showNotification('Error al comparar las fotos ❌', 'error');
      }
    }; */


    const comparePhotos = async () => {
        if (!secondImgSrc) {
            showNotification('Falta la foto para comparar ❌', 'error');
            return;
        }

        try {
            // Realizar la solicitud POST a la Lambda
            const lambdaResponse = await fetch('https://3yksz3lr73.execute-api.us-east-1.amazonaws.com/dev/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user.username, // Enviar el nombre del usuario
                    targetKey: secondImgSrc // Enviar la clave de la nueva foto
                }),
            });

            if (!lambdaResponse.ok) {
                throw new Error('Error al realizar la comparación');
            }

            const result = await lambdaResponse.json();
            setComparisonResult(result);
            console.log('Resultado de la comparación:', result);

            // Mostrar el resultado
            if (result.match) {
                showNotification(`¡Pago exitoso! Similitud: ${result.similarity}%`);
            } else {
                showNotification('Pago denegado, no se halló coincidencia ❌', 'error');
            }
        } catch (error) {
            console.error('Error al comparar fotos:', error);
            showNotification('Error al comparar fotos ❌', 'error');
        }
    };

    const handleFotoReferencia = () => {
        setFotoReferencia(!fotoReferencia)
    }

    const handleFotoComparacion = () => {
        setFotoComparacion(!fotoComparacion)
    }



    return (
        <div style={{ padding: '20px' }}>
            <nav
                style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h1 style={{ margin: 0 }}>Bienvenido {user.username}</h1>
                <button
                    onClick={signOut}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Cerrar Sesión
                </button>
            </nav>

            {notification.show && (
                <div
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        backgroundColor: notification.type === 'error' ? '#dc3545' : '#28a745',
                        color: 'white',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '16px',
                        fontWeight: '500',
                        animation: 'slideIn 0.5s ease-out',
                        transition: 'all 0.3s ease',
                        maxWidth: '300px'
                    }}
                >
                    {notification.message}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                <button onClick={handleFotoReferencia} style={{
                    backgroundColor: '#4F0CF5',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <FontAwesomeIcon icon={faUserSecret} style={{ fontSize: "22px", paddingLeft: 2, paddingRight: 10 }} />
                    <p>Registra tu Foto</p>
                </button>
                {fotoReferencia ? (
                    <>
                        {!imgSrc ? (
                            <>
                                <Webcam
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    style={{
                                        borderRadius: '10px',
                                        maxWidth: '100%',
                                        height: 'auto',
                                    }}
                                />
                                <button
                                    onClick={capture}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Capturar Foto
                                </button>
                            </>
                        ) : (
                            <>
                                <img
                                    src={imgSrc}
                                    alt=""
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '10px',
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={retake}
                                        style={{
                                            backgroundColor: '#ffc107',
                                            color: 'black',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Tomar otra foto
                                    </button>
                                    <button
                                        onClick={savePhoto}
                                        disabled={isUploading}
                                        style={{
                                            borderBlockColor: "#28A745",
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            cursor: isUploading ? 'not-allowed' : 'pointer',
                                            opacity: isUploading ? 0.7 : 1,
                                        }}
                                    >
                                        {isUploading ? 'Guardando...' : 'Guardar Foto'}
                                    </button>
                                </div>
                                {/* Botón para activar la comparación de identidad */}

                            </>
                        )}
                    </>
                ) : (<></>)}
                {<button
                    onClick={handleFotoComparacion}
                    style={{
                        backgroundColor: 'white', // Cambié a blanco para destacar el borde
                        color: '#4F0CF5', // Cambié el color del texto al azul del borde anterior
                        border: '2px solid #4F0CF5', // Borde verde (puedes cambiarlo a cualquier color)
                        borderWidth: 2,
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '20px',
                    }}
                >
                    <div style={{height:"50px", width:"140px", display:'flex' ,alignItems:"center", justifyContent:'center'}}>
                        <div style={{ width: "80px", height: "50px", overflow: "hidden", display:'flex' ,alignItems:"center", justifyContent:'center' , marginLeft:"-50px"}}>
                            <img src={logo} alt="My SVG Icon" style={{ width: '80px', height: '80px', transform: "translateX(56px)" }} />
                        </div>
                        <p>Pay</p>
                    </div>

                </button>}
                {fotoComparacion && (
                    <>
                        {/* Vista para capturar la segunda foto */}
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            style={{
                                borderRadius: '10px',
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                        <button
                            onClick={capture}
                            style={{
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Capturar Foto para procesar el pago
                        </button>
                        {secondImgSrc && (
                            <>
                                <img
                                    src={secondImgSrc}
                                    alt=""
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '10px',
                                        marginTop: '20px',
                                    }}
                                />
                                <button
                                    onClick={retake}
                                    style={{
                                        backgroundColor: '#ffc107',
                                        color: 'black',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Tomar otra foto
                                </button>
                                <button
                                    onClick={uploadSecondPhoto}
                                    disabled={isUploading}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                        opacity: isUploading ? 0.7 : 1,
                                    }}
                                >
                                    {isUploading ? 'Subiendo...' : 'Subir segunda foto'}
                                </button>
                                <button onClick={comparePhotos}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px'
                                    }}
                                >
                                    Comparar Fotos
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
            {
                comparisonResult && (
                    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '10px' }}>
                        <h2>Resultado del Pago</h2>
                        <p>{comparisonResult.message}</p>
                        {comparisonResult.match && <p>Similitud: {comparisonResult.similarity}%</p>}
                    </div>
                )
            }
        </div >
    );
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;a
    }
  }
`;
document.head.appendChild(style);

export default withAuthenticator(CustomAuthenticate);