import { useEffect, useState } from "react";

export type UserActionLog = {
  type: "play" | "pause" | "click" | "seek" | "chat" | string;
  timestamp: string;
  videoTime?: number;
  [key: string]: any;
};

type Props = {
  videoRef: React.RefObject<any>; // video.js 的 Player 实例
};

export default function UserActionLogger({ videoRef }: Props) {
  const [behaviorLogs, setBehaviorLogs] = useState<UserActionLog[]>([]);

  // 播放 / 暂停事件监听
  useEffect(() => {
    const player = videoRef.current?.player;
    if (!player) return;

    const handlePlay = () => {
      logAction("play", player.currentTime());
    };

    const handlePause = () => {
      logAction("pause", player.currentTime());
    };

    player.on("play", handlePlay);
    player.on("pause", handlePause);

    return () => {
      player.off("play", handlePlay);
      player.off("pause", handlePause);
    };
  }, [videoRef.current?.player]);

  // 统一日志记录函数
  const logAction = (type: string, videoTime?: number, extra: any = {}) => {
    const logEntry: UserActionLog = {
      type,
      timestamp: new Date().toISOString(),
      videoTime,
      ...extra,
    };
    setBehaviorLogs(prev => [...prev, logEntry]);
    console.log("User Action Logged:", logEntry); // 调试用
  };

  return null; // 这个组件不渲染任何UI
}
