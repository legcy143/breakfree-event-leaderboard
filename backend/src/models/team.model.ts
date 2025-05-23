import mongoose, { Document, Schema } from "mongoose";

// Interface for Team document
export interface ITeam extends Document {
  name: string;
  companyName: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Team
const teamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Team model
const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
