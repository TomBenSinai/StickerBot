import { ActionIcon, Tooltip } from '@mantine/core'
import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'

const ColorSchemeToggle = (): JSX.Element => {
	const { setColorScheme } = useMantineColorScheme()
	const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
	return (
		<Tooltip label={colorScheme === 'light' ? 'Switch to dark' : 'Switch to light'}>
			<ActionIcon
				variant="subtle"
				aria-label="Toggle color scheme"
				onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
			>
				{colorScheme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
			</ActionIcon>
		</Tooltip>
	)
}

export default ColorSchemeToggle


