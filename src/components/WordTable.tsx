import { getWords } from "@/lib/words";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button";
import { Pause, Play } from "lucide-react";
interface WordAudioPlayerProps {
    word: any;
};
export const WordAudioPlayer: React.FC<WordAudioPlayerProps> = ({ word }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };


    return (
        <li className="flex items-center bg-white p-4 gap-2 rounded-2xl">
            <Button size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6" />}
            </Button>
            <h2 className="font-bold">{word.text}</h2>
            <audio
                ref={audioRef}
                className="hidden"
                onEnded={() => setIsPlaying(false)}
            >
                <source src={URL.createObjectURL(word.audio)} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </li>
    );
};

export const WordTable = () => {
    const [words, setWords] = useState<any[]>([]);
    async function refreshWords() {
        const wordsData = await getWords();
        setWords(wordsData);
    }
    useEffect(() => {
        refreshWords();
    }, []);
    return (<React.Fragment>
        <ul className="flex flex-col items-center justify-center gap-4">
            {words.map((word, index) => (
                <WordAudioPlayer key={index} word={word} />

            ))}
        </ul>
    </React.Fragment>);
}