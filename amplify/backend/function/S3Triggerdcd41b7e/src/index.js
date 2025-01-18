const { RekognitionClient, CompareFacesCommand } = require("@aws-sdk/client-rekognition");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Inicializar clientes con la región correcta
const rekognitionClient = new RekognitionClient({ region: process.env.REGION });
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
    try {
        console.log('Método HTTP:', event.httpMethod);
        console.log('Ruta:', event.path);
        console.log('Evento recibido:', JSON.stringify(event, null, 2));
        console.log('Bucket configurado:', process.env.BUCKET_NAME);

        const bucketName = process.env.BUCKET_NAME;

        // Manejo de la solicitud OPTIONS (Preflight CORS)
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ message: "Preflight OK" }),
            };
        }

        // Manejar solicitud HTTP POST para comparar imágenes
        if (event.httpMethod === 'POST' && event.path === '/compare') {
          
            
            const {user, targetKey } = JSON.parse(event.body);

            if (!targetKey) {
                return {
                    statusCode: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type"
                    },
                    body: JSON.stringify({ message: "Se requiere la clave de la imagen de comparación." }),
                };
            }

            // Buscar la última foto con prefijo "photo-"
            console.log(`Buscando la última foto con prefijo 'photo-'... del usuario ${user}`);
            const listParams = {
                Bucket: bucketName,
                Prefix: `public/${user}/photo-`, // Filtrar solo objetos que comienzan con "photo-"
            };

            const listCommand = new ListObjectsV2Command(listParams);
            const listResponse = await s3Client.send(listCommand);

            if (!listResponse.Contents || listResponse.Contents.length === 0) {
                return {
                    statusCode: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type"
                    },
                    body: JSON.stringify({ message: "No se encontraron fotos de referencia en el bucket." }),
                };
            }

            // Seleccionar la última foto basada en la fecha de modificación
            const lastPhoto = listResponse.Contents.sort((a, b) => 
                new Date(b.LastModified) - new Date(a.LastModified)
            )[0];

            const sourceKey = lastPhoto.Key;
            console.log(`Última foto encontrada: ${sourceKey}`);

            const targetKeyWithPrefix = `public/${targetKey}`;
            const sourceKeyWithPrefix = `${sourceKey}`;

            // Configurar parámetros para Rekognition CompareFaces
            const compareParams = {
                SourceImage: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: sourceKeyWithPrefix,
                    },
                },
                TargetImage: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: targetKeyWithPrefix,
                    },
                },
                SimilarityThreshold: 90, // Umbral de similitud
            };

            const compareCommand = new CompareFacesCommand(compareParams);
            const compareResult = await rekognitionClient.send(compareCommand);

            console.log('Resultado de Rekognition:', JSON.stringify(compareResult, null, 2));

            const faceMatches = compareResult.FaceMatches;
            if (faceMatches && faceMatches.length > 0) {
                const similarity = faceMatches[0].Similarity;
                return {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type"
                    },
                    body: JSON.stringify({
                        message: "Las imágenes coinciden.",
                        similarity: similarity,
                        match: true,
                    }),
                };
            } else {
                return {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type"
                    },
                    body: JSON.stringify({
                        message: "Las imágenes no coinciden.",
                        match: false,
                    }),
                };
            }
        }

        // Si la solicitud no coincide con ninguna ruta/método
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: "Ruta no encontrada." }),
        };

    } catch (error) {
        console.error('Error completo:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ 
                error: error.message,
                details: error.stack
            }),
        };
    }
};