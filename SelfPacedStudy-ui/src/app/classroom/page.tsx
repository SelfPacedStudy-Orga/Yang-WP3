'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChatToolbar from "@/components/chat/ChatToolbar";
import ChatBox from "@/components/chat/ChatBox";
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { useRouter, useSearchParams } from 'next/navigation';
import { IMessage } from '@/components/chat/Message';
import useOutsideClickDetector from "@/utils/UseOutsideClickDetectorHook";
import AlertDialog from "@/components/generic/AlertDialog";
import Cookies from 'js-cookie';
import VideoPlayer from "@/components/video-player/VideoPlayer";
import ClassroomToolbar from "@/components/generic/ClassroomToolbar";
import CustomAlertModal from "@/components/generic/CustomAlertModal";


// 上传 transcript 文件组件
const TranscriptUploader = ({
  onUploadComplete,
  setTranscriptFile, // 🟩 新增
}: {
  onUploadComplete: (result: any) => void;
  setTranscriptFile: (file: File) => void; // 🟩 新增
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTranscriptFile(file); // 🟩 同步给父组件
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a transcript file.');
      return;
    }
    const formData = new FormData();
    formData.append('transcript', selectedFile);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/socratic/uploadSocratic`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Upload API result:', result);
      if (response.ok && result.questionnaire) {
        onUploadComplete(result);
      } else {
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading transcript:', error);
      alert('Upload error');
    }
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <p><strong>Transcript File (.txt or .pdf):</strong></p> {/* ✅ 加这一行提示 */}
      <input type="file" accept=".txt,.pdf" onChange={handleFileChange} />
      <Button variant="contained" onClick={handleUpload} sx={{ ml: 1 }}>
        Upload Transcript
      </Button>
    </Box>
  );
};

const ClassroomPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [isVideoManuallyPaused, setIsVideoManuallyPaused] = useState(true);
  const [messages, setMessages] = useState<IMessage[]>([{
    id: 1,
    text: "Hi there, how can I help you?",
    sender: "bot",
    isImage: false,
    image: null
  }]);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isInLastTwentyMinutes, setIsInLastTwentyMinutes] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [showSlideMessage, setShowSlideMessage] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [shouldHideChatBox, setShouldHideChatBox] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<any[]>([]);
  const [isUserInitiatedPause, setIsUserInitiatedPause] = useState(false);
  const [customAlertOpen, setCustomAlertOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [controlPopup, setControlPopup] = useState(true);
  const [popupAppearedTimestamp, setPopupAppearedTimestamp] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputBaseRef = useRef(null);
  const imageButtonRef = useRef(null);
  const sendButtonRef = useRef(null);
  const videoUrl = searchParams.get('videoUrl');
  // 参数 fromExperiment 决定是否显示问卷
  const fromExperiment = searchParams.get('fromExperiment') === 'true';
  const [userId, setUserId] = useState('');
  const isControlGroup = searchParams.get('isTest') === 'yes';
  const [selectedTranscriptFile, setSelectedTranscriptFile] = useState<File | null>(null);
  const [selectedSlidesFile, setSelectedSlidesFile] = useState<File | null>(null);

  const [isVideoPlayable, setIsVideoPlayable] = useState(false); // 视频是否可播放
  const [isFileUploaded, setIsFileUploaded] = useState(false); // 文件是否上传
  const [isPreTestCompleted, setIsPreTestCompleted] = useState(false); // 预试题是否完成

  // 问卷状态：问卷数据、用户作答记录以及从后端返回的 transcript （可选）
  const [socraticQuestions, setSocraticQuestions] = useState<any[]>([]);
  const [socraticAnswers, setSocraticAnswers] = useState<{ [index: number]: string }>({});
  const [showSocraticModal, setShowSocraticModal] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [isSocraticCompleted, setIsSocraticCompleted] = useState(false);

  const [receivedTranscript, setReceivedTranscript] = useState('');
  const [interactionFrequency, setInteractionFrequency] = useState('');
  const frequencyOptions = [
  { label: 'low', value: 'low' },
  { label: 'medium', value: 'medium' },
  { label: 'high', value: 'high' },
    ];
  const [difficultyData, setDifficultyData] = useState<any>({});
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  

    useEffect(() => {
      const fetchDifficultyData = async () => {
        // 假设后端 API 返回了视频段落的难度评分和对应选择题
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/score-difficulty`);  // 替换为实际的 API 地址
        const data = await response.json();
        setDifficultyData(data);
  
        // 将段落标题、难度评分和选择题格式化
        const segments = Object.keys(data);
        const segmentQuestions = segments.map((segment, index) => {
          return {
            title: segment,
            difficulty: data[segment].difficulty,
            questions: data[segment].questions || [],
            startTime: (index * (videoDuration / segments.length)), // 假设每段时间均分
            endTime: ((index + 1) * (videoDuration / segments.length)),
          };
        });
        setQuestions(segmentQuestions);
      };
  
      fetchDifficultyData();
    }, [videoDuration]);
  
    // 处理视频时间变化，检查是否到达难度评分大于 50 的段落
    useEffect(() => {
      if (videoDuration > 0) {
        const currentSegment = questions.find((segment) => {
          return videoPosition >= segment.startTime && videoPosition < segment.endTime;
        });
  
        if (currentSegment && currentSegment.difficulty > 50 && currentSegmentIndex !== questions.indexOf(currentSegment)) {
          // 如果该段难度评分大于 50，暂停视频并弹出选择题
          setCurrentSegmentIndex(questions.indexOf(currentSegment));
          setIsVideoPaused(true);
          setCurrentQuestionIndex(questions.indexOf(currentSegment));
        }
      }
    }, [videoPosition, videoDuration, questions, currentSegmentIndex]);
  
    // 处理选择题答案变化
    const handleAnswerChange = (questionIndex: number, selected: string) => {
      const isCorrect = questions[questionIndex].questions.some((q: any) => q.answer === selected);
      setIsAnswerCorrect(isCorrect);
    };
  
    // 提交答案
    const handleSubmitAnswer = () => {
      if (isAnswerCorrect !== null) {
        setIsVideoPaused(false); // 如果用户回答了，继续播放视频
        setCurrentQuestionIndex(-1); // 关闭问题弹窗
        setIsAnswerCorrect(null);
      }
    };
  


  useEffect(() => {
    const userIdFromCookies = Cookies.get('userId');
    if (userIdFromCookies) {
      setUserId(userIdFromCookies);
    }
  }, []);

  useEffect(() => {
    const fetchShouldHideChatBox = async () => {
      try {
        if (fromExperiment) {
          const userIdCookie = Cookies.get('userId');
          if (userIdCookie) {
            setShouldHideChatBox(false);
          }
        }
      } catch (error) {
        console.error('Error fetching shouldHideChatBox:', error);
      }
    };
    fetchShouldHideChatBox();
  }, [fromExperiment]);

  useEffect(() => {
    if (fromExperiment) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        setCustomAlertOpen(true);
        event.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [userId, fromExperiment]);

  useEffect(() => {
    if (!videoUrl) {
      router.replace('/');
    }
  }, [videoUrl, router]);

  useEffect(() => {
    if (!fromExperiment) {
      setAlertDialogOpen(true);
    }
  }, [fromExperiment]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (fromExperiment && videoDuration > 0 && videoPosition >= (videoDuration - 1200)) {
        setIsInLastTwentyMinutes(true);
      } else {
        setIsInLastTwentyMinutes(false);
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [fromExperiment, videoDuration, videoPosition]);

  useEffect(() => {
    if (controlPopup && videoDuration > 0 && videoPosition >= (videoDuration / 2)) {
      setPopupAppearedTimestamp(Date.now());
      setPopupVisible(true);
      setIsVideoManuallyPaused(true);
      setControlPopup(false);
    }
  }, [videoPosition, videoDuration, controlPopup]);

  const handleAlertBoxClose = () => {
    setAlertDialogOpen(false);
  };

  const handleBack = () => {
    router.replace('/');
  };

  useEffect(() => {
    if (uploadedImage !== null) {
      const newMessage: IMessage = {
        id: messages.length + 1,
        text: "",
        sender: "user",
        isImage: true,
        image: uploadedImage
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
  }, [uploadedImage]);

  useEffect(() => {
    console.log('Updated messages:', messages);
  }, [messages]);

  useOutsideClickDetector(chatBoxRef, () => {
    if (isChatBoxOpen) setIsChatBoxOpen(false);
  }, [inputBaseRef, imageButtonRef, sendButtonRef]);

  // 模拟消息处理逻辑
  const handleNewMessage = useCallback(async (newMessageText: string) => {
    if (!newMessageText || newMessageText.length === 0) {
      console.error("Message text cannot be empty.");
      return; // 不继续执行
    }
  
    const newMessage: IMessage = {
      id: messages.length + 1,
      text: newMessageText,
      sender: "user",
      isImage: false,
      image: null
    };
  
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("message", newMessageText);
      formData.append("timestamp", Math.floor(videoPosition * 1000).toString()); // 转成毫秒
      formData.append("userId", userId);
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      const botMessage: IMessage = {
        id: messages.length + 2,
        text: data?.reply || "⚠️ 出错了，机器人没有返回内容。",
        sender: "bot",
        isImage: false,
        image: null
      };
  
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Error calling chat API:", err);
    }
  
    setIsLoading(false);
  }, [messages, userId, videoPosition]);
  
  

  const handleImageUpload = useCallback((file: File) => {
    if (!isChatBoxOpen) setIsChatBoxOpen(true);
    setUploadedImage(file);
  }, [isChatBoxOpen]);

  const handleHistoryDownload = async () => {
    try {
      const userIdCookie = Cookies.get('userId');
      if (!userIdCookie) throw new Error('User ID not found');
      const blob = new Blob(["This is your chat history"], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = "mypdfDocument.pdf";
      link.click();
    } catch (error) {
      console.error('Error downloading the PDF:', error);
    }
  };

  // 屏幕录制和截图部分（保持原有逻辑）
  const requestScreenRecordingPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      let mediaRecorder;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
      } else {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      }
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        if (recordedChunksRef.current.length === 0) return;
        const mimeType = isSafari ? 'video/mp4' : 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const video = document.createElement('video');
        video.src = url;
        video.onloadeddata = () => {
          if (video.videoWidth && video.videoHeight) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imgData = canvas.toDataURL('image/png');
              setCapturedImageUrl(imgData);
              console.log("New Image is captured");
              URL.revokeObjectURL(url);
            } else {
              console.error('Failed to get canvas context.');
            }
          } else {
            console.error('Video loaded but no frames were captured.');
          }
        };
        video.onerror = error => console.error('Error loading video for screenshot capture:', error);
        video.play().catch(error => console.error('Error playing video for screenshot capture:', error));
      };
      mediaRecorder.start();
      setPermissionGranted(true);
    } catch (error) {
      console.error('Error requesting screen recording permission:', error);
      alert('Screen recording permission was denied or an error occurred.');
    }
  };

  const handleScreenshotCapture = () => {
    if (mediaRecorderRef.current && permissionGranted) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 500);
    }
  };

  const handleOpenChatBox = () => {
    setIsVideoManuallyPaused(true);
    if (fromExperiment) {
      setTimeout(() => { setIsChatBoxOpen(true); }, 500);
    } else {
      setIsChatBoxOpen(true);
    }
  };

  const handlePause = (isPaused: boolean) => {
    if (isPaused) {
      handleScreenshotCapture();
    }
    setIsUserInitiatedPause(isPaused);
  };

  useEffect(() => {
    if (isUserInitiatedPause) {
      handleScreenshotCapture();
    }
  }, [isUserInitiatedPause]);

  const handlePopupClose = async () => {
    if (popupAppearedTimestamp) {
      const reactionTime = Date.now() - popupAppearedTimestamp;
      console.log("User reaction time:", reactionTime, "ms");
    }
    setPopupVisible(false);
    setIsVideoManuallyPaused(false);
  };

  // 处理问卷答案变化
  const handleSocraticAnswerChange = (questionIndex: number, selected: string) => {
    setSocraticAnswers(prev => ({ ...prev, [questionIndex]: selected }));
  };

  // 修改后的提交问卷答案逻辑：计算得分并 POST 到后端
  const handleSubmitSocraticAnswers = async () => {
    let correctCount = 0;
    socraticQuestions.forEach((q, index) => {
      if (socraticAnswers[index] === q.answer) correctCount++;
    });
    const total = socraticQuestions.length;
    const accuracy = correctCount / total;

    if (!selectedTranscriptFile || !selectedSlidesFile) {
      alert("Please upload both transcript and slides files.");
      return;
    }

    if (!interactionFrequency) {
      alert("请选择互动频率");
      return;
    }
  
    const formData = new FormData();
    formData.append('preTestAccuracy', accuracy.toString());
    formData.append('interactionFrequency', interactionFrequency);
    formData.append('userId', userId);
    formData.append('fromExperiment', 'true');
    formData.append('lectureNumber', '1');
  
    // transcript 和 slides 是文件，需要重新上传
    formData.append('transcript', selectedTranscriptFile); // 你要存一下文件
    formData.append('slides', selectedSlidesFile);         // 同上
  

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/score-difficulty`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      console.log("Difficulty Score Result:", result);
    } catch (err) {
      console.error("Error posting to transcriptExperiment:", err);
    }
    
    setShowCorrectAnswers(true);
    //setShowSocraticModal(false);
    //setIsVideoManuallyPaused(false);
  };
  

  // 当 transcript 上传完成后，接收返回的数据（包含 transcript 和问卷）
  const handleTranscriptUploadComplete = (result: any) => {
    setIsFileUploaded(true);  // 设置文件已上传
    setReceivedTranscript(result.transcript);
    setSocraticQuestions(result.questionnaire);
    setShowSocraticModal(true);  // 显示问卷
  };

  const askQuestion = (currentTime: number) => {
    const questionText = `You rewound to ${currentTime.toFixed(1)} seconds. Can you tell me what the issue is with this part?`;
  
    const newQuestionMessage: IMessage = {
      id: Date.now(),
      text: questionText,
      sender: 'bot',
      isImage: false,
      image: null,
    };
  
    console.log('Asking question:', newQuestionMessage);
    setMessages(prevMessages => [...prevMessages, newQuestionMessage]);
  };
  

  return (
    
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div className="my-6 p-4 border rounded-2xl shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-2">Please select interactoin frequency</h3>
          <div className="flex gap-4">
            {frequencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setInteractionFrequency(option.value)}
                className={`px-4 py-2 rounded-full border transition
                  ${interactionFrequency === option.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <Box>
            <p>Upload File:</p>
            <input
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedSlidesFile(file);
              }}
            />
          </Box>
        </Box>

      {/* 上传 transcript 的组件 */}
      <TranscriptUploader
         onUploadComplete={handleTranscriptUploadComplete}
          setTranscriptFile={setSelectedTranscriptFile}
      />
      <AlertDialog
        open={alertDialogOpen}
        handleClose={handleAlertBoxClose}
        title=""
        description={
          <span>
            Before you start chatting, please note that we will save your chat history after the session ends.
            Starting the chat implies your acknowledgment.
            You can also download your chat as PDF by clicking the download button anytime.
            <br />
            <strong>Note: You will be asked to share your screen. Please ensure you only share the current window.</strong>
          </span>
        }
      />
      <ClassroomToolbar
        onBack={handleBack}
        onDownload={handleHistoryDownload}
        userId={userId}
        fromExperiment={fromExperiment}
        isControlGroup={isControlGroup}
        isInLastTwentyMinutes={isInLastTwentyMinutes}
        shouldHideChatBox={shouldHideChatBox}
      />
      {/* 苏格拉底问卷对话框 */}
      <Dialog open={showSocraticModal} fullWidth maxWidth="sm">
        <DialogTitle>Please answer the following questions before starting the video</DialogTitle>
        <DialogContent>
          {socraticQuestions.map((q, index) => (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <Box component="p" sx={{ fontWeight: 'bold' }}>{q.question}</Box>
              <RadioGroup
                  value={socraticAnswers[index] || ''}
                  onChange={(e) => handleSocraticAnswerChange(index, e.target.value)}
                >
                  {q.options.map((option: string, idx: number) => {
                    const userAnswer = socraticAnswers[index];
                    const isCorrect = option === q.answer;
                    const isSelected = userAnswer === option;

                    // 设置 label 后缀符号
                    let label = option;
                    if (showCorrectAnswers) {
                      if (isCorrect) label += ' ✅';
                      if (isSelected && !isCorrect) label += ' ❌';
                    }

                    // 设置颜色样式
                    let colorStyle = {};
                    if (showCorrectAnswers) {
                      if (isCorrect) {
                        colorStyle = { color: 'green', fontWeight: 'bold' };
                      } else if (isSelected && !isCorrect) {
                        colorStyle = { color: 'red', fontWeight: 'bold' };
                      }
                    }

                    return (
                      <FormControlLabel
                        key={idx}
                        value={option}
                        control={<Radio disabled={showCorrectAnswers} />}
                        label={label}
                        sx={colorStyle}
                      />
                    );
                  })}
                </RadioGroup>
            </Box>
          ))}
        </DialogContent>

       <DialogActions>
        {!showCorrectAnswers ? (
          <Button
            variant="contained"
            onClick={handleSubmitSocraticAnswers}
            disabled={Object.keys(socraticAnswers).length < socraticQuestions.length}
          >
            Submit Answers
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setShowSocraticModal(false);
              setIsVideoManuallyPaused(false);
              setShowCorrectAnswers(false);
              setIsSocraticCompleted(true);
            }}
          >
            Close and Start Video
          </Button>
        )}
      </DialogActions>
      </Dialog>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '-webkit-fill-available', padding: 1 }}>
        <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', overflow: 'hidden' }} ref={containerRef}>
          <VideoPlayer
            url={videoUrl || ''}
            isChatBoxOpen={isChatBoxOpen}
            isVideoManuallyPaused={isVideoManuallyPaused}
            setIsVideoManuallyPaused={(value: boolean) => {
              setIsVideoManuallyPaused(value);
              if (value) handlePause(value);
            }}
            setVideoPosition={setVideoPosition}
            setVideoDuration={setVideoDuration}
            onVideoBehavior={(action: string) => {
              const timestamp = new Date().toISOString();
              console.log(`[Video Behavior] ${action} @ ${timestamp}`);
              let behaviorMessage = "";
              if (action.includes("Paused")) {
                behaviorMessage = `Student paused the video at ${videoPosition} seconds.`;
              } else {
                behaviorMessage = `Student rewound the video to ${videoPosition} seconds. Could you explain why you rewound?`;
              }
              if (behaviorMessage) {
                const newMessage: IMessage = {
                  id: messages.length + 1,
                  text: behaviorMessage,
                  sender: "bot",
                  isImage: false,
                  image: null,
                };
                console.log('Recording behavior:', newMessage);
                setMessages(prev => [...prev, newMessage]);
              }
            }}
            askQuestion={askQuestion}
          />
           {/* 显示当前段落的选择题 */}
          {currentQuestionIndex >= 0 && (
            <Dialog open={currentQuestionIndex >= 0} onClose={() => setCurrentQuestionIndex(-1)}>
              <DialogTitle>{questions[currentQuestionIndex]?.title}</DialogTitle>
              <DialogContent>
                <RadioGroup
                  value=""
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                >
                  {questions[currentQuestionIndex]?.questions.map((question: any, idx: number) => (
                    <FormControlLabel
                      key={idx}
                      value={question.answer}
                      control={<Radio />}
                      label={question.options.join(' / ')}
                    />
                  ))}
                </RadioGroup>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSubmitAnswer} color="primary">
                  {isAnswerCorrect === null ? "Submit Answer" : isAnswerCorrect ? "Correct! Continue" : "Incorrect! Try Again"}
                </Button>
              </DialogActions>
            </Dialog>
          )}
          {isChatBoxOpen && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1200 }} />
          )}
          {isChatBoxOpen && (
            <Slide in={isChatBoxOpen} direction="up" container={containerRef.current}>
              <Box sx={{ position: 'absolute', width: '100%', bottom: 0, zIndex: 1300 }} ref={chatBoxRef}>
                <ChatBox messages={messages} isLoading={isLoading} />
              </Box>
            </Slide>
          )}
          {popupVisible && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1400,
              backgroundColor: 'white',
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center',
              width: 400
            }}>
              <p>Would you like to continue to watch Video?</p>
              <Box sx={{ mt: 2 }}>
                <button onClick={handlePopupClose} style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Continue
                </button>
              </Box>
            </Box>
          )}
        </Box>
        {!shouldHideChatBox && (
          <ChatToolbar
            onOpenChatBox={handleOpenChatBox}
            onCloseChatBox={() => setIsChatBoxOpen(false)}
            isChatBoxOpen={isChatBoxOpen}
            inputRef={inputBaseRef}
            imageButtonRef={imageButtonRef}
            sendButtonRef={sendButtonRef}
            onSendMessage={handleNewMessage}
            onImageUpload={handleImageUpload}
          />
        )}
      </Box>
      <CustomAlertModal
        open={customAlertOpen}
        onClose={() => setCustomAlertOpen(false)}
        userId={userId}
        fromExperiment={fromExperiment}
        isControlGroup={isControlGroup}
        shouldHideChatbox={shouldHideChatBox}
      />
    </Box>
  );
};

export default ClassroomPage;
