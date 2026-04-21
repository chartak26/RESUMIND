import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText(`Error: ${imageFile.error || 'Failed to convert PDF to image'}`);

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        
        // Check for error response
        if (!feedback || (feedback && 'success' in feedback && !feedback.success)) {
            const errorMsg = (feedback && 'error' in feedback) ? feedback.error : 'Failed to analyze resume';
            return setStatusText(`Error: ${errorMsg}`);
        }

        console.log('Full Feedback response:', JSON.stringify(feedback, null, 2));
        console.log('Message object:', feedback.message);
        console.log('Message content:', feedback.message?.content);

        let feedbackText = '';
        try {
            // Try different ways the message might be structured
            if (typeof feedback.message?.content === 'string') {
                feedbackText = feedback.message.content;
            } else if (Array.isArray(feedback.message?.content)) {
                // Reconstruct text from array of content blocks
                feedbackText = feedback.message.content
                    .map((item: any) => item.text || item.content || '')
                    .join('');
            } else if (typeof feedback.message === 'string') {
                feedbackText = feedback.message;
            } else if (typeof feedback.message === 'object' && feedback.message !== null) {
                // Try to extract text from various possible structures
                feedbackText = feedback.message.text || 
                              feedback.message.content || 
                              feedback.message.response ||
                              JSON.stringify(feedback.message);
            }

            console.log('Extracted feedback text:', feedbackText.substring(0, 200)); // First 200 chars

            if (!feedbackText) {
                console.error('No feedback text extracted from:', feedback);
                return setStatusText('Error: No response content from AI');
            }

        const parsedFeedback = JSON.parse(feedbackText);
            console.log('Parsed feedback:', parsedFeedback);
            
            // Ensure feedback has the expected structure with default values
            data.feedback = {
                overallScore: parsedFeedback.overallScore ?? 0,
                ATS: parsedFeedback.ATS ?? { score: 0, tips: [] },
                toneAndStyle: parsedFeedback.toneAndStyle ?? { score: 0, tips: [] },
                content: parsedFeedback.content ?? { score: 0, tips: [] },
                structure: parsedFeedback.structure ?? { score: 0, tips: [] },
                skills: parsedFeedback.skills ?? { score: 0, tips: [] },
            };
        } catch (err) {
            console.error('Failed to parse feedback:', err);
            console.error('Raw feedback text:', feedbackText);
            console.error('Original message:', feedback.message);
            
            // Fallback: Create default feedback structure instead of failing
            console.warn('Using fallback feedback structure');
            data.feedback = {
                overallScore: 0,
                ATS: { score: 0, tips: [] },
                toneAndStyle: { score: 0, tips: [] },
                content: { score: 0, tips: [] },
                structure: { score: 0, tips: [] },
                skills: { score: 0, tips: [] },
            };
            
            // Show user what went wrong but at least save something
            return setStatusText(`Analysis complete but couldn't parse results. Please check console. Redirecting...`);
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log('Final data being saved:', data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload