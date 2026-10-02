import { useLayoutContext } from '@/context/useLayoutContext'
import HorizontalLayout from '@/layouts/HorizontalLayout'
import VerticalLayout from '@/layouts/VerticalLayout'
import { Outlet } from 'react-router'
const MainLayout = () => {
  const { orientation } = useLayoutContext()
  return (
    <>
      {orientation === 'vertical' && (
        <VerticalLayout>
          <Outlet />
        </VerticalLayout>
      )}
      {orientation === 'horizontal' && (
        <HorizontalLayout>
          <Outlet />
        </HorizontalLayout>
      )}
    </>
  )
}
export default MainLayout
