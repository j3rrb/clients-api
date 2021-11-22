import { PassportStatic } from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { JWT_SECRET } from '../constants';
import { ClientModel } from '../models/client';

const opts = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// Estratégia de codificação JWT
export default function (passport: PassportStatic) {
  const strategy = new JWTStrategy(
    opts,
    async (payload: { id: string; name: string }, next) => {
      const client = await ClientModel.findById({ _id: payload.id }).clone();

      if (client) {
        next(null, { id: client._id, name: client.name });
      } else {
        next(null, false, { error: 'Unauthorized!' });
      }
    },
  );

  return passport.use(strategy);
}
