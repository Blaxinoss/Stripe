import Search from '../Components/Search'

type Props = {}

export default function Home({ }: Props) {
    return (
        <>


            <div className="father flex w-[100%] h-[100%]">


                <div className="space-y-6 space-x-6 w-[100%] align-top justify-center ">
                    <h1 className="font-Peach text-center">Hello <span className="text-[2.9rem] transform duration-75 animate-pulse ">world</span></h1>
                    <Search />
                </div>
            </div>
        </>
    )
}