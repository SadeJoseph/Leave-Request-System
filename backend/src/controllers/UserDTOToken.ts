import { Role } from "../entity/Role"; 

export class UserDTOToken{    
  constructor(
    readonly email: string,
    readonly role: { id: number; name: string },
    public id: number
  ) {}
}