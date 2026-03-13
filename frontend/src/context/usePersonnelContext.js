import { useContext } from 'react'
import { PersonnelContext } from './PersonnelContextObject'

export const usePersonnelContext = () => useContext(PersonnelContext)