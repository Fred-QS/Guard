<?php

namespace App\DataFixtures\Providers;

use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Provider\Base as BaseProvider;


class HashPasswordProvider extends BaseProvider
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher)
    {

    }

    public function hashPassword(string $plainPassword): string
    {
        return $this->passwordHasher->hashPassword(
            new User,
            $plainPassword
        );
    }

}
