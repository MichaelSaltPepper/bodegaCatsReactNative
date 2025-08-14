// TabBarIcon.tsx
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';

interface Props {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TabBarIcon: FC<Props> = ({ name, color }) => (
  <Ionicons name={name} size={28} style={{ marginBottom: -3 }} color={color} />
);

export default TabBarIcon;