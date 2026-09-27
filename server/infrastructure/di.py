"""依赖注入容器机制 - 服务实例的注册、解析与生命周期管理。

服务名常量见 ``server.common.service_names``；注册表与工厂在 ``server.bootstrap``（组合根）。
"""

import asyncio
import logging
from enum import Enum, auto
from typing import Any, Callable, Type, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


class Scope(Enum):
    """Service lifecycle scope."""
    SINGLETON = auto()  # Single instance for entire application
    TRANSIENT = auto()  # New instance on each resolve


class ServiceContainer:
    """
    Simple dependency injection container for managing service instances.

    Features:
    - Singleton service registration
    - Lazy initialization
    - Dependency resolution
    - Lifecycle management
    """

    _instance: "ServiceContainer | None" = None
    _lock: asyncio.Lock = asyncio.Lock()

    def __init__(self) -> None:
        self._services: dict[str, Any] = {}
        self._factories: dict[str, Callable[..., Any]] = {}
        self._type_registry: dict[Type, tuple[Callable[..., Any], Scope]] = {}
        self._initialized = False

    @classmethod
    async def get_instance(cls) -> "ServiceContainer":
        """Get singleton instance of ServiceContainer."""
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = ServiceContainer()
        return cls._instance

    @classmethod
    def get_sync(cls) -> "ServiceContainer":
        """Get container instance synchronously (use only if already initialized)."""
        if cls._instance is None:
            cls._instance = ServiceContainer()
        return cls._instance

    def register(self, name: str, factory: Callable[..., T]) -> None:
        """
        Register a service factory.

        Args:
            name: Service name/identifier
            factory: Factory function to create the service
        """
        self._factories[name] = factory
        logger.debug(f"Registered service factory: {name}")

    def register_instance(self, name: str, instance: Any) -> None:
        """
        Register an existing service instance.

        Args:
            name: Service name/identifier
            instance: Pre-created service instance
        """
        self._services[name] = instance
        logger.debug(f"Registered service instance: {name}")

    def get(self, name: str) -> Any:
        """
        Get a service instance by name.

        Args:
            name: Service name/identifier

        Returns:
            Service instance

        Raises:
            KeyError: If service is not registered
        """
        # Return cached instance if exists
        if name in self._services:
            return self._services[name]

        # Create from factory
        if name in self._factories:
            instance = self._factories[name]()
            self._services[name] = instance
            logger.debug(f"Created service instance: {name}")
            return instance

        raise KeyError(f"Service not registered: {name}")

    async def get_async(self, name: str) -> Any:
        """
        Get a service instance asynchronously.

        Use this for services that require async initialization.
        """
        # Return cached instance if exists
        if name in self._services:
            return self._services[name]

        # Create from factory
        if name in self._factories:
            factory = self._factories[name]
            if asyncio.iscoroutinefunction(factory):
                instance = await factory()
            else:
                instance = factory()
            self._services[name] = instance
            logger.debug(f"Created async service instance: {name}")
            return instance

        raise KeyError(f"Service not registered: {name}")

    def has(self, name: str) -> bool:
        """Check if a service is registered."""
        return name in self._services or name in self._factories

    def register_type(
        self,
        service_type: Type[T],
        factory: Callable[..., T],
        scope: Scope = Scope.SINGLETON
    ) -> None:
        """
        Register a service by type with specified scope.

        Args:
            service_type: The type/class to register
            factory: Factory function to create the service
            scope: Lifecycle scope (SINGLETON or TRANSIENT)
        """
        self._type_registry[service_type] = (factory, scope)
        logger.debug(f"Registered type: {service_type.__name__} ({scope.name})")

    def resolve(self, service_type: Type[T]) -> T:
        """
        Resolve a service by type with full type safety.

        Args:
            service_type: The type/class to resolve

        Returns:
            Instance of the requested type

        Raises:
            KeyError: If type is not registered
        """
        if service_type not in self._type_registry:
            raise KeyError(f"Type not registered: {service_type.__name__}")

        factory, scope = self._type_registry[service_type]

        if scope == Scope.SINGLETON:
            # Check cache first
            if service_type in self._services:
                return self._services[service_type]
            # Create and cache
            instance = factory()
            self._services[service_type] = instance
            return instance
        else:
            # TRANSIENT: always create new
            return factory()

    def clear(self) -> None:
        """Clear all registered services."""
        self._services.clear()
        self._factories.clear()
        self._type_registry.clear()


def get_container() -> ServiceContainer:
    """Get the service container instance (sync)."""
    return ServiceContainer.get_sync()


async def get_container_async() -> ServiceContainer:
    """Get the service container instance (async)."""
    return await ServiceContainer.get_instance()
