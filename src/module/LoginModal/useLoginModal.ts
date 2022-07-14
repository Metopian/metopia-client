
import { useDispatch } from 'react-redux'
import { displayLoginModal, hideLoginModal } from '../../config/redux/modalControllerSlice'

const useLoginModal = () => {
    const dispatch = useDispatch()
    const display = (stepRequired: number) => {
        dispatch(displayLoginModal(stepRequired))
    }
    const hide = () => {
        dispatch(hideLoginModal())
    }
    return { display, hide }
}

export { useLoginModal }
