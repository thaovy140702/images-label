import { FunctionComponent } from "react";
import styles from './LeftSideBar.module.scss'
import { Flex, Tag, Typography } from "antd";
import { labelsData } from "../data/labelData";
import { SiInstructure } from "react-icons/si";

interface RightSideBarProps {
    onSelectColor: (color: string, name: string) => void;
}

const RightSideBar: FunctionComponent<RightSideBarProps> = ({ onSelectColor }) => {

    const {Text} = Typography

    const handleAddLabel = (color: any, name: string) => {
        onSelectColor(color, name);
    }
    return (
        <div>
            <div className={styles.header}>
                <p>Labels list</p>
            </div>

            <Flex gap="10px 0" wrap="wrap" className={styles.labelComponent}>
                {
                    labelsData.map((item) => {
                        return (
                            <Tag
                                key={item.id}
                                color={item.color}
                                style={{ cursor: 'pointer'}}
                                onClick={() => handleAddLabel(item.color, item.name)}
                                >
                                    {item.name}
                                </Tag>
                        )
                    })
                }
            </Flex>

            <div className={styles.instruction}>
                <SiInstructure style={{ color: 'green', fontSize: '24px'}}/>
                <Text>Click the label first, then select the object in the image.</Text>
            </div>
        </div>
    )
}

export default RightSideBar