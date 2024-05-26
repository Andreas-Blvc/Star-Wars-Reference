import React from 'react';
import { Descriptions, List, Modal } from 'antd';
import { CharacterDetailsFragment, FilmFragment } from '../graphql/__generated__/types';

interface CharacterModalProps {
	selectedCharacter: CharacterDetailsFragment | null;
	setSelectedCharacter: (character: CharacterDetailsFragment | null) => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({
	selectedCharacter,
	setSelectedCharacter,
}) => {
	return (
		<Modal
			open={!!selectedCharacter}
			onCancel={() => setSelectedCharacter(null)}
			footer={null}
		>
			{selectedCharacter && (
				<div>
					<Descriptions title="Character Details" bordered column={1}>
						<Descriptions.Item label="Name">{selectedCharacter?.name || '-'}</Descriptions.Item>
						<Descriptions.Item label="Height">{selectedCharacter?.height || '-'}</Descriptions.Item>
						<Descriptions.Item label="Mass">{selectedCharacter?.mass || '-'}</Descriptions.Item>
						<Descriptions.Item label="Homeworld">{selectedCharacter?.homeworld?.name || '-'}</Descriptions.Item>
						<Descriptions.Item label="Species">{selectedCharacter?.species?.name || '-'}</Descriptions.Item>
						<Descriptions.Item label="Gender">{selectedCharacter?.gender || '-'}</Descriptions.Item>
						<Descriptions.Item label="Eye Color">{selectedCharacter?.eyeColor || '-'}</Descriptions.Item>
					</Descriptions>
					<List
						header={<div>Movies</div>}
						bordered
						dataSource={selectedCharacter?.filmConnection?.films ?? []}
						renderItem={(film: FilmFragment | null) => (
							film &&
							<List.Item>
								{film.title}
							</List.Item>
						)}
						style={{ marginTop: 16 }}
					/>
				</div>
			)}
		</Modal>
	);
};

export default CharacterModal;