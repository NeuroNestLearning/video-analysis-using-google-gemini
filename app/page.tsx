"use client";
import {useEffect, useRef, useState} from 'react';
import {initializeApp} from 'firebase/app';
import {getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import {addDoc, collection, getFirestore} from 'firebase/firestore';
import {getGenerativeModel, getVertexAI} from "firebase/vertexai-preview";
import {firebaseClientConfig} from "../config";
import ReactMarkdown from 'react-markdown';
import {AnimatePresence, motion} from 'framer-motion';

const app = initializeApp(firebaseClientConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize Vertex AI
const vertexAI = getVertexAI(app, {location: "us-east5"});

export default function Home() {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [status, setStatus] = useState('');
    const fileInputRef = useRef(null);
    const analysisRef = useRef(null);

    useEffect(() => {
        if (analysisResult || error) {
            analysisRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [analysisResult, error]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size <= 4 * 1024 * 1024) {
            setFile(selectedFile);
            setError(null);
            setVideoPreview(URL.createObjectURL(selectedFile));
            setAnalysisResult(null);
            setStatus('');
        } else {
            setError('Please select a video file under 4MB.');
            setFile(null);
            setVideoPreview(null);
            setStatus('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const storageRef = ref(storage, `videos/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
                setStatus('Uploading');
            },
            (error) => {
                setError('Upload failed: ' + error.message);
                setStatus('');
            },
            async () => {
                setStatus('Analyzing');
                await analyzeVideo(uploadTask.snapshot.ref.bucket, uploadTask.snapshot.ref.fullPath);
            }
        );
    };

    const analyzeVideo = async (bucket: string, path: string) => {
        try {
            const generativeModel = getGenerativeModel(vertexAI, {
                model: "gemini-1.5-flash",
                //systemInstruction: "" //add system instructions
            });

            const videoFilePart = {
                file_data: {
                    file_uri: `gs://${bucket}/${path}`,
                    mime_type: 'video/mp4',
                },
            };

            const textPart = {text: 'Analyze this video and provide a summary:'}
            const request = {
                contents: [{role: 'user', parts: [videoFilePart, textPart]}],
            };

            const response = await generativeModel.generateContent(request);
            const result = response.response.text();
            setAnalysisResult(result);
            setStatus('Analysis done');
            await storeAnalysisInFireStore(bucket, path, result);
        } catch (error) {
            setError('Analysis failed: ' + error.message);
            setStatus('');
        }
    };

    const storeAnalysisInFireStore = async (bucket: string, path: string, result: string) => {
        try {
            await addDoc(collection(db, 'videoAnalysis1'), {
                bucket: bucket,
                filePath: path,
                analysis: result,
                timestamp: new Date()
            });
        } catch (error) {
            setError('Upload to firestore failed: ' + error.message);
            setStatus('');
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
            <motion.h1
                className="text-4xl font-bold mb-8 text-center"
                initial={{opacity: 0, y: -50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                Video Upload and Analysis
            </motion.h1>

            <motion.div
                className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 max-w-4xl mx-auto"
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.5}}
            >
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
                >
                    Select Video
                </button>
                {file && (
                    <p className="text-sm text-gray-400 mb-4">
                        Selected file: {file.name}
                    </p>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Upload and Analyze
                </button>
            </motion.div>

            <AnimatePresence>
                {(uploadProgress > 0 || status === 'Analyzing') && (
                    <motion.div
                        className="mb-8 max-w-4xl mx-auto"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.5}}
                    >
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                                style={{width: status === 'Analyzing' ? '100%' : `${uploadProgress}%`}}
                            ></div>
                        </div>
                        <p className="text-sm mt-2 text-center text-gray-400">
                            {status === 'Analyzing' ? 'Analyzing...' :
                                status === 'Analysis done' ? 'Analysis complete' :
                                    `${uploadProgress.toFixed(2)}% uploaded`}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.p
                        className="text-red-400 mt-4 text-center"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.5}}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {analysisResult && (
                    <motion.div
                        className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -50}}
                        transition={{duration: 0.5}}
                        ref={analysisRef}
                    >
                        <h2 className="text-2xl font-semibold mb-4">Analysis Result</h2>
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {videoPreview && (
                    <motion.div
                        className="mt-8 max-w-md mx-auto"
                        initial={{opacity: 0, y: 50}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -50}}
                        transition={{duration: 0.5}}
                    >
                        <h2 className="text-2xl font-semibold mb-4 w-full">Video Preview</h2>
                        <video
                            src={videoPreview}
                            controls
                            className="w-full rounded-lg shadow-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}