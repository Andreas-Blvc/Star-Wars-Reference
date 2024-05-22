import React from 'react';
import { Descriptions, List } from 'antd';
import { CharacterDetailsFragment } from '../graphql/fragments';
import { FragmentType, useFragment } from '../generated/fragment-masking'


const CharacterDetails = (props: {
	characterDetails: FragmentType<typeof CharacterDetailsFragment>
}) => {
	const character = useFragment(CharacterDetailsFragment, props.characterDetails);

	return (
		<div>
			<Descriptions title="Character Details" bordered column={1}>
				<Descriptions.Item label="Name">{character?.name || '-'}</Descriptions.Item>
				<Descriptions.Item label="Height">{character?.height || '-'}</Descriptions.Item>
				<Descriptions.Item label="Mass">{character?.mass || '-'}</Descriptions.Item>
				<Descriptions.Item label="Homeworld">{character?.homeworld?.name || '-'}</Descriptions.Item>
				<Descriptions.Item label="Species">{character?.species?.name || '-'}</Descriptions.Item>
				<Descriptions.Item label="Gender">{character?.gender || '-'}</Descriptions.Item>
				<Descriptions.Item label="Eye Color">{character?.eyeColor || '-'}</Descriptions.Item>
			</Descriptions>
			<List
				header={<div>Movies</div>}
				bordered
				dataSource={character?.filmConnection?.films ?? []}
				renderItem={(film: any) => (
					<List.Item>
						{film.title}
					</List.Item>
				)}
				style={{ marginTop: 16 }}
			/>
		</div>
	);
};

export default CharacterDetails;
