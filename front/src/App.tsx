/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useContext } from 'react';
import './App.css';
import ModalAddWords from './components/ModalAddWords';
import ForceShowKeyboard from './components/ForceShowKeyboard';
import HiddenWord from './components/HiddenWord';
import LettersTyped from './components/LettersTyped';
import Tools from './components/Tools';
import Message from './components/Message';
import { Context } from './context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { getRandomInt, validateIsLoser, validateIsWinner } from './utils';
import { getWords } from './store/features/play/thunk';
import { setGameIsOver } from './store/features/play/slice';
import DrawingPerson from './components/DrawingPerson';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const lettersTyped = new Set<string>();

function App() {
	const dispatch = useDispatch();
	const playStore = useSelector((state: RootState) => state.play);

	const { setHiddenWord, hiddenWord, inputLetters } = useContext(
		Context,
	) as ContextType;

	const eventWindowKeyUp = useRef<(evt: KeyboardEvent) => void>();

	const [showModal, setShowModal] = useState<boolean>(false);
	const [letterTyped, setLetterTyped] = useState<string>();

	useEffect(() => {
		if (playStore.data.words === null && playStore.error === null) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dispatch(getWords() as any);
		}
	}, []);

	useEffect(() => {
		if (playStore.data.words?.length) {
			const maxWords = playStore.data.words.length;
			const indexWord = getRandomInt(maxWords);
			setHiddenWord(playStore.data.words[indexWord]);
		}
	}, [playStore.data.words]);

	useEffect(() => {
		eventWindowKeyUp.current = (evt: KeyboardEvent) => {
			const letterEntered = evt.key;

			if (!lettersTyped.has(letterEntered)) {
				lettersTyped.add(letterEntered);
				setLetterTyped(letterEntered);
			}
		};

		if (showModal === false) {
			window.addEventListener('keyup', eventWindowKeyUp.current);
		}

		return () => {
			if (!showModal && eventWindowKeyUp.current)
				window.removeEventListener('keyup', eventWindowKeyUp.current);
		};
	}, [showModal]);

	useEffect(() => {
		if (playStore.data.gameIsOver && eventWindowKeyUp.current) {
			window.removeEventListener('keyup', eventWindowKeyUp.current);
		}
	}, [playStore.data.gameIsOver]);

	useEffect(() => {
		if (hiddenWord) {
			if (validateIsWinner(inputLetters.great, hiddenWord))
				dispatch(setGameIsOver(true));
			else if (
				validateIsLoser(inputLetters.wrong, playStore.data.maximumAttempts)
			)
				dispatch(setGameIsOver(true));
		}
	}, [inputLetters.great, inputLetters.wrong]);

	return (
		<>
			<div className="flex flex-col gap-3 justify-center items-center m-auto w-full">
				{isMobile && <ForceShowKeyboard />}
				<DrawingPerson />
				{isMobile && (
					<span className="absolute top-2 left-2 text-white">mobile</span>
				)}
				<HiddenWord letterTyped={letterTyped} />
				<LettersTyped />
				{playStore.data.gameIsOver && <Message />}
			</div>
			<Tools>
				<>
					<div>
						{playStore.error && (
							<p className="text-red-500 text-sm">
								There was an error to get words from API Server, so we are using
								a default list of words.
							</p>
						)}
					</div>
					<div>
						{!playStore.error && (
							<a
								className="text-gray-500 text-sm transition duration-500 ease-in-out hover:text-gray-100"
								onClick={() => setShowModal(true)}
							>
								add words
							</a>
						)}
					</div>
				</>
			</Tools>
			{showModal && <ModalAddWords setShow={setShowModal} />}
		</>
	);
}

export default App;
