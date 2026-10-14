import { ReactNode } from "react";
import { VacationModel } from "../../../models/vacation-model";
import { appConfig } from "../../../utils/app-config";
import "./vacation-card.css";

type VacationCardProps = {
    vacation: VacationModel;
    children?: ReactNode; // Buttons shown on the image - Like for users, Edit and Delete for admins.
};

export function VacationCard(props: VacationCardProps) {
    return (
        <div className="VacationCard">

            <div className="image-container">
                <img src={appConfig.vacationImagesUrl + props.vacation.imageName} alt={props.vacation.destination} />
                <div className="actions">{props.children}</div>
                <h3>{props.vacation.destination}</h3>
            </div>

            <p className="dates">{props.vacation.startDate} - {props.vacation.endDate}</p>

            <p className="description">{props.vacation.description}</p>

            <p className="price">Price: ${props.vacation.price}</p>

        </div>
    );
}
