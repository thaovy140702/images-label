import { CSSProperties, FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from './MainScreen.module.scss'
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { MdOutlineClear } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import LeftSideBar from "../components/LeftSideBar";
import RightSideBar from "../components/RightSideBar";
import { Typography } from "antd";
import { imagesData } from "../data/imagesData";
import rough from 'roughjs/bundled/rough.esm'
import { Element, ElementWithId, ElementWithRoughElement, LabelCoordinates } from "../models/Element";

const buttonStyle: CSSProperties = {
    fontSize: '24px',
    color: 'white',
    cursor: 'pointer'
}

const textStyle: CSSProperties = {
    fontSize: '16px',
    color: 'white',
    margin: '0 10px'
}

const arrowStyle: CSSProperties = {
    color: 'white',
    cursor: 'pointer'
}

const generator = rough.generator()


const { Text } = Typography

const MainScreen: FunctionComponent = () => {

    // carousel
    const [images, setImages] = useState(imagesData[0].image)
    const [index, setIndex] = useState(0)

    // color label
    const [selectedColor, setSelectedColor] = useState('');
    // label
    const [label, setLabel] = useState('')
    // canvas
    const widthCanvas = window.innerWidth - 320
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [elements, setElements] = useState<ElementWithRoughElement[]>([])
    // const [elements, setElements] = useState<ElementWithText[]>([]);
    const [action, setAction] = useState('none')
    const [tool, setTool] = useState('none')
    const [selectedElement, setSelectedElement] = useState<ElementWithId | null>(null);
    const [labelCoordinates, setLabelCoordinates] = useState<LabelCoordinates>()

    // carousel
    const length = imagesData.length
    const handleCarousel = (action: string) => {
        setElements([]);
        if (action === "next") {
            let newIndex = index + 1;
            setIndex(newIndex >= length ? 0 : newIndex)
        } else {
            let newIndex = index - 1;
            setIndex(newIndex < 0 ? length - 1 : newIndex)
        }
    }

    // handle select color label
    const handleColorSelection = (color: any, name: string) => {
        setSelectedColor(color);
        setLabel(name)
    }

    // drawing canvas
    const createElement = (id: any, x1: number, y1: number, x2: number, y2: number, label: string, color: string) => {
        const options = {
            stroke: selectedColor,
            strokeWidth: 2,
            fill: 'transparent'
        };
        const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options)
        setLabelCoordinates({ x1, y2 })
        return { id, x1, y1, x2, y2, roughElement, label, color }
    }

    const isWithinElement = (x: number, y: number, element: any) => {

        const { x1, x2, y1, y2 } = element

        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)

        return x >= minX && x <= maxX && y >= minY && y <= maxY

    }

    const getElementAtPosition = (x: number, y: number, elements: any[]) => {
        return elements.find((element: any) => isWithinElement(x, y, element))
    }

    const adjustElementCoordinates = (element: Element) => {
        const { x1, y1, x2, y2 } = element
        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)
        return { minX, minY, maxX, maxY }
    }

    const deleteSelectedRectangle = () => {
        setElements([]);
    }

    useEffect(() => {
        setImages(imagesData[index].image)
    }, [index])

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !labelCoordinates || !selectedColor) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        const roughCanvas = rough.canvas(canvas)

        elements.forEach(({ roughElement, label, color, x1, y2 }) => {
            roughCanvas.draw(roughElement)
            context.font = "24px sans-serif";
            context.fillStyle = color
            context.fillText(label, x1 + 10, y2 - 10);
        });

        // context.font = "24px sans-serif";
        //     context.fillStyle = selectedColor
        //     context.fillText(label, labelCoordinates.x1 + 10, labelCoordinates.y2 - 10);

    }, [elements]);

    const updateElement = (id: any, x1: number, y1: number, x2: number, y2: number) => {
        const updatedElement = createElement(id, x1, y1, x2, y2, label, selectedColor)
        const elementsCopy = [...elements]
        elementsCopy[id] = updatedElement
        setElements(elementsCopy)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = e;
        const clickedElement = getElementAtPosition(clientX, clientY, elements);

        if (clickedElement) {
            const offsetX = clientX - clickedElement.x1
            const offsetY = clientY - clickedElement.y1
            setTool('selection');
            setSelectedElement({ ...clickedElement, offsetX, offsetY });
            setAction('moving');
        } else {
            setTool('none');
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, label, selectedColor);
            setElements(prevState => [...prevState, element]);
            setAction('drawing');
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = e

        if (tool === 'selection') {
            const canvas = e.target as HTMLCanvasElement;
            canvas.style.cursor = getElementAtPosition(clientX, clientY, elements)
                ? "move"
                : "default";
        }
        if (action === 'drawing') {
            const index = elements.length - 1
            const { x1, y1 } = elements[index]
            updateElement(index, x1, y1, clientX, clientY)
        } else if (action === 'moving' && selectedElement !== null) {
            const { id, x1, x2, y1, y2, offsetX, offsetY } = selectedElement
            const width = x2 - x1
            const height = y2 - y1
            const nexX1 = clientX - offsetX
            const nexY1 = clientY - offsetY
            updateElement(id, nexX1, nexY1, nexX1 + width, nexY1 + height)
        }

    }

    const handleMouseUp = () => {
        const index = elements.length - 1
        const { id } = elements[index]
        if (action === 'drawing') {
            const { minX, minY, maxX, maxY } = adjustElementCoordinates(elements[index])
        }
        setAction('none')
        setSelectedElement(null)
    }

    const handleLogData = () => {
        const data = {
            id: imagesData[index].id,
            url: imagesData[index].image,
            imageName: imagesData[index].name,
            array: elements.map(element => ({
                id: element.id,
                label: element.label,
                coordinates: { x1: element.x1, y1: element.y1, x2: element.x2, y2: element.y2 },
                height: Math.abs(element.y2 - element.y1),
                width: Math.abs(element.x2 - element.x1)
            }))
        };

        console.log("Data",data)

    }

    return (
        <div className={styles.parentComponent} style={{ position: 'relative' }}>
            <canvas
                ref={canvasRef}
                width={widthCanvas}
                height={550}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
            <LeftSideBar />
            <div className={styles.centerComponent}>
                <div className={styles.imageInfo}>
                    <Text style={textStyle}>{imagesData[index].name}</Text>
                    <Text style={textStyle}>12/03/2024</Text>
                </div>
                <div className={styles.imageFrame}>
                    <div className={styles.imageContainer}>

                        <img src={images} alt="lables" width='100%' height='100%' style={{ objectFit: 'contain' }} />
                    </div>
                </div>
                <div className={styles.buttonComponent}>
                    <FaCircleArrowLeft style={arrowStyle} onClick={() => handleCarousel('previous')} />
                    <MdOutlineClear style={buttonStyle} onClick={deleteSelectedRectangle} />
                    <FaCheck style={buttonStyle} onClick={handleLogData}/>
                    <FaCircleArrowRight style={arrowStyle} onClick={() => handleCarousel('next')} />
                </div>
            </div>
            <RightSideBar onSelectColor={handleColorSelection} />
        </div>

    )
}

export default MainScreen