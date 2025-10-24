import { getServerSession } from "next-auth";
import Header from "../_components/header";
import { authOptions } from "../_lib/auth";
import { notFound } from "next/navigation";
import BookingItem from "../_components/booking-item";
import { getConfirmedBookings } from "../_data/get-confirmed-bookings";
import { getConcludedBookings } from "../_data/get-concluded-bookings";
import { Card, CardContent } from "../_components/ui/card";

const Bookings = async () => {
    const session =  await getServerSession(authOptions)
    if (!session?.user) {
        //TODO: mostrar pop-up de login
        return notFound()
    }
    const confirmedBookings = await getConfirmedBookings()

    const concludedBookings = await getConcludedBookings()

    return ( <>
        
        <Header isHidden="md:flex"/>
        <div className=" space-y-3 px-5 pt-5 md:pt-10 md:px-64">
            <h1 className="font-bold text-xl md:text-2xl md:mb-2">Agendamentos</h1>
            {confirmedBookings.length == 0 && concludedBookings.length == 0 && (
                <p className="text-gray-400">Você não tem agendamentos.</p>
            )}
            <div className="md:flex md:gap-10">
                <div className="flex-1 space-y-3">
            {confirmedBookings.length > 0 && (
                <>
                    <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                    Confirmados
                    </h2>
                
                    {confirmedBookings.map(booking => <BookingItem key={booking.id} booking={JSON.parse(JSON.stringify(booking))}/> )}
                        
                </>
            )}
            {concludedBookings.length > 0 && (
                <>
                    <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                    Finalizados
                     </h2>
                    {concludedBookings.map(booking => <BookingItem key={booking.id} booking={JSON.parse(JSON.stringify(booking))}/> )}
                </>
            )}
                </div>
            <Card className="hidden md:block mt-16 self-start w-[380px]">
                <CardContent>
                    teste
                    <p>dwdw</p>
                    <p>dwdw</p>
                    <p>dwdw</p>
                </CardContent>
            </Card>
            </div>   
        </div>
    </> );
}
 
export default Bookings;